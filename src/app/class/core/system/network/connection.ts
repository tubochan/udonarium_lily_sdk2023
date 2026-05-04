import { IPeerContext } from './peer-context';
import { IRoomInfo } from './room-info';

// 接続コールバック定義（元祖v1.17.0に合わせてIPeerContext型に変更）
export class ConnectionCallback {
  onOpen: (peerId: string) => void;
  onClose: (peerId: string) => void;
  onConnect: (peerId: string) => void;
  onDisconnect: (peerId: string) => void;
  onData: (peerId: string, data: any) => void;
  onError: (peerId: string, errorType: string, errorMessage: string, errorObject: any) => void;
}

// 接続インターフェース定義（元祖v1.17.0に合わせて拡張）
export interface Connection {
  readonly peerId: string;
  readonly peerIds: string[];
  readonly peer: IPeerContext;
  readonly peers: IPeerContext[];
  readonly callback: ConnectionCallback;
  readonly bandwidthUsage: number;

  configure(config: any): void;
  open(userId?: string): void;
  open(userId: string, roomId: string, roomName: string, password: string): void;
  close(): void;
  connect(peer: IPeerContext): boolean;
  disconnect(peer: IPeerContext): boolean;
  disconnectAll(): void;
  send(data: any, sendTo?: string): void;
  listAllPeers(): Promise<string[]>;
  listAllRooms(): Promise<IRoomInfo[]>;
}
