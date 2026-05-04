import { setZeroTimeout } from '../util/zero-timeout';
import { Connection, ConnectionCallback } from './connection';
import { IPeerContext, PeerContext } from './peer-context';
import { IRoomInfo } from './room-info';

type QueueItem = { data: any, sendTo: string };

const unknownContext = PeerContext.parse('???');

// ネットワーク管理クラス（ダイナミックインポートでskyway/skyway2023を切り替え）
export class Network {
  private static _instance: Network;
  static get instance(): Network {
    if (!Network._instance) Network._instance = new Network();
    return Network._instance;
  }

  get peerId(): string { return this.connection ? this.connection.peerId : unknownContext.peerId; }
  get peerIds(): string[] { return this.connection ? this.connection.peerIds.concat() : []; }

  // 新インターフェース（peer / peers）
  get peer(): IPeerContext { return this.connection ? this.connection.peer : unknownContext; }
  get peers(): IPeerContext[] { return this.connection ? this.connection.peers.concat() : []; }

  // 旧インターフェース（peerContext / peerContexts）後方互換のために残す
  get peerContext(): IPeerContext { return this.peer; }
  get peerContexts(): IPeerContext[] { return this.peers; }

  get isOpen(): boolean { return this.connection && this.connection.peer ? this.connection.peer.isOpen : false; }

  readonly callback: ConnectionCallback = new ConnectionCallback();
  get bandwidthUsage(): number { return this.connection ? this.connection.bandwidthUsage : 0; }

  private config: any = {};
  private connection: Connection;

  private queue: Set<QueueItem> = new Set();
  private sendInterval: number = null;
  private sendCallback = () => { this.sendQueue(); };
  private callbackUnload: any = (e) => { this.close(); };

  private constructor() {
    console.log('Network ready...');
  }

  // 設定を適用する（LOAD_CONFIGイベントで呼ばれる）
  configure(config: any) {
    this.config = config ?? {};
  }

  open(peerId?: string): void;
  open(userId: string, roomId: string, roomName: string, password: string): void;
  open(...args: any[]) {
    this.openAsync(...args);
  }

  private async openAsync(...args: any[]) {
    if (this.connection && this.connection.peer) {
      console.warn('It is already opened.');
      this.close();
    }

    console.log('Network open...', args);
    this.connection = await this.dynamicImport(this.config);
    this.connection.open.apply(this.connection, args);

    window.addEventListener('unload', this.callbackUnload, false);
  }

  // 旧skyway版の円柱デバッグ用メソッド（後方互換のために残す）
  connectionClose() {
    if (this.connection) this.connection.close();
    this.connection = null;
    window.removeEventListener('unload', this.callbackUnload, false);
    console.log('Network close...円柱');
  }

  private close() {
    if (this.connection) this.connection.close();
    this.connection = null;
    window.removeEventListener('unload', this.callbackUnload, false);
    console.log('Network close...');
  }

  connect(peerId: string): boolean {
    if (this.connection) return this.connection.connect(PeerContext.parse(peerId));
    return false;
  }

  disconnect(peerId: string) {
    if (!this.connection) return;
    if (this.connection.disconnect(PeerContext.parse(peerId))) {
      console.log('<disconnectPeer()> Peer:' + peerId);
    }
  }

  send(data: any, sendTo?: string) {
    this.queue.add({ data: data, sendTo: sendTo });
    if (this.sendInterval === null) {
      this.sendInterval = setZeroTimeout(this.sendCallback);
    }
  }

  private sendQueue() {
    let broadcast: any[] = [];
    let unicast: { [sendTo: string]: any[] } = {};
    let echocast: any[] = [];

    let loopCount = this.queue.size < 128 ? this.queue.size : 128;
    for (let item of this.queue) {
      if (loopCount <= 0) break;
      loopCount--;
      this.queue.delete(item);
      if (item.sendTo == null) {
        broadcast.push(item.data);
      } else if (item.sendTo === this.peerId) {
        echocast.push(item.data);
      } else {
        if (!(item.sendTo in unicast)) unicast[item.sendTo] = [];
        unicast[item.sendTo].push(item.data);
      }
    }

    // できるだけ一纏めにして送る
    if (this.connection) {
      if (broadcast.length) this.connection.send(broadcast);
      for (let sendTo in unicast) this.connection.send(unicast[sendTo], sendTo);
    }

    // 自分自身への送信（echocastはpeerContextを使わず直接コールバック）
    if (this.callback.onData) {
      this.callback.onData(null, broadcast);
      this.callback.onData(this.peerId, echocast);
    }

    if (0 < this.queue.size) {
      this.sendInterval = setZeroTimeout(this.sendCallback);
    } else {
      this.sendInterval = null;
    }
  }

  // 旧SkyWay互換のため残す（configure()に統合済み）
  setApiKey(key: string) {
    console.log('setApiKey is deprecated. Use configure() instead.');
    if (!this.config) this.config = {};
    if (!this.config.webrtc) this.config.webrtc = {};
    this.config.webrtc.key = key;
  }

  listAllPeers(): Promise<string[]> {
    return this.connection ? this.connection.listAllPeers() : Promise.resolve([]);
  }

  listAllRooms(): Promise<IRoomInfo[]> {
    return this.connection ? this.connection.listAllRooms() : Promise.resolve([]);
  }

  // config.backend.mode に応じて動的に接続クラスを切り替える
  private async dynamicImport(config: any): Promise<Connection> {
    let mode = config?.backend?.mode ?? 'skyway';
    console.log(`Network mode: ${mode}`);

    let connection: Connection;

    if (mode === 'skyway2023') {
      // 新SkyWay（@skyway-sdk/core）を使用
      let module = await import('./skyway2023/skyway-connection');
      connection = new module.SkyWayConnection();
    } else {
      // 旧SkyWay（skyway-js / PeerJS）を使用
      let module = await import('./skyway/skyway-connection');
      connection = new module.SkyWayConnection();
    }

    connection.configure(config);

    // コールバックを設定（EventSystemがNetwork.instance.callbackを監視しているため、ここでTriggerする必要はない）
    connection.callback.onOpen = (peerId) => {
      if (this.callback.onOpen) this.callback.onOpen(peerId);
    };
    connection.callback.onClose = (peerId) => {
      if (this.callback.onClose) this.callback.onClose(peerId);
    };
    connection.callback.onConnect = (peerId) => {
      if (this.callback.onConnect) this.callback.onConnect(peerId);
    };
    connection.callback.onDisconnect = (peerId) => {
      if (this.callback.onDisconnect) this.callback.onDisconnect(peerId);
    };
    connection.callback.onData = (peerId, data: any[]) => {
      if (this.callback.onData) this.callback.onData(peerId, data);
    };
    connection.callback.onError = (peerId, errorType, errorMessage, errorObject) => {
      if (this.callback.onError) this.callback.onError(peerId, errorType, errorMessage, errorObject);
    };

    if (0 < this.queue.size && this.sendInterval === null) this.sendInterval = setZeroTimeout(this.sendCallback);

    return connection;
  }
}
