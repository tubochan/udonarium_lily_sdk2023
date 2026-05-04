import { AuthToken, ChannelScope, nowInSec, SkyWayAuthToken, uuidV4 } from '@skyway-sdk/core';

// バックエンドAPIとの通信クラス（認証トークン取得）
export class SkyWayBackend {
  constructor(readonly url: string) { }

  async alive(): Promise<boolean> {
    return fetchStatus(this.url);
  }

  // バックエンドサーバからSkyWay認証トークンを取得する
  async createSkyWayAuthToken(channelName: string, peerId: string): Promise<string> {
    return fetchSkyWayAuthToken(this.url, channelName, peerId);
  }
}

async function fetchStatus(url: string): Promise<boolean> {
  try {
    let api = new URL('/v1/status', url);
    let response = await fetch(api.toString());

    return response.status === 200;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// バックエンドAPIからSkyWay認証トークンを取得する
async function fetchSkyWayAuthToken(url: string, channelName: string, peerId: string): Promise<string> {
  try {
    let api = new URL('/v1/skyway2023/token', url);

    let body = JSON.stringify({
      formatVersion: 1,
      channelName: channelName,
      peerId: peerId,
    });

    let response = await fetch(api.toString(), { method: 'POST', body: body });

    if (response.status !== 200) return '';

    let jsonObj = await response.json();
    return jsonObj.token ?? '';
  } catch (err) {
    console.error(err);
    return '';
  }
}
