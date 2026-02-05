import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENV } from '@/src/shared/config/env';
import { storage } from '@/src/shared/lib/storage';
import type {
  CellData,
  CellLock,
  CellStyle,
  WebSocketMessage,
} from '../model/schema';

export interface SpreadsheetWebSocketHandlers {
  onCellLockAcquired?: (lock: CellLock) => void;
  onCellLockDenied?: (cellAddress: string, lockedByUser: string) => void;
  onCellUpdated?: (cellAddress: string, data: CellData, userId: string, userName: string) => void;
  onCellUnlocked?: (cellAddress: string, userId: string) => void;
  onUserJoined?: (userId: string, userName: string) => void;
  onUserLeft?: (userId: string, userName: string) => void;
  onError?: (message: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class SpreadsheetWebSocketClient {
  private client: Client;
  private subscription: StompSubscription | null = null;
  private userSubscription: StompSubscription | null = null;
  private spreadsheetId: string | null = null;
  private handlers: SpreadsheetWebSocketHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    const wsUrl = this.getWebSocketUrl();

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: this.getHeaders(),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        this.reconnectAttempts = 0;
        this.handlers.onConnected?.();
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.handlers.onDisconnected?.();
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers.message);
        this.handlers.onError?.(frame.headers.message || 'WebSocket error');
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.handlers.onError?.('Connection failed after multiple attempts');
        }
      },
    });
  }

  private getWebSocketUrl(): string {
    const wsUrl = ENV.SPREADSHEET_WS_URL;
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${protocol}//${window.location.host}${wsUrl}`;
    }
    return wsUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    const tenantSlug = storage.getTenantSlug();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

    const token = storage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const userId = storage.getUserId?.();
    if (userId) {
      headers['X-User-Id'] = String(userId);
    }

    const userName = storage.getUserName?.();
    if (userName) {
      headers['X-User-Name'] = userName;
    }

    return headers;
  }

  connect(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect(): void {
    this.unsubscribe();
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  subscribeToSpreadsheet(spreadsheetId: string, handlers: SpreadsheetWebSocketHandlers): void {
    this.spreadsheetId = spreadsheetId;
    this.handlers = handlers;

    if (!this.client.active) {
      this.connect();

      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        originalOnConnect?.(frame);
        this.performSubscription();
      };
    } else {
      this.performSubscription();
    }
  }

  private performSubscription(): void {
    if (!this.spreadsheetId) return;

    this.unsubscribe();

    this.subscription = this.client.subscribe(
      `/topic/spreadsheet/${this.spreadsheetId}`,
      (message: IMessage) => {
        this.handleMessage(message);
      }
    );

    this.userSubscription = this.client.subscribe(
      '/user/queue/reply',
      (message: IMessage) => {
        this.handleMessage(message);
      }
    );
  }

  private handleMessage(message: IMessage): void {
    try {
      const data = JSON.parse(message.body) as WebSocketMessage;

      switch (data.type) {
        case 'CELL_LOCK_ACQUIRED':
          this.handlers.onCellLockAcquired?.(data.payload as CellLock);
          break;
        case 'CELL_LOCK_DENIED': {
          const denied = data.payload as { cellAddress: string; lockedByUser: string };
          this.handlers.onCellLockDenied?.(denied.cellAddress, denied.lockedByUser);
          break;
        }
        case 'CELL_UPDATED': {
          const updated = data.payload as {
            cellAddress: string;
            value: string | null;
            displayValue: string | null;
            formula: string | null;
            style: CellStyle | null;
            userId: string;
            userName: string;
          };
          this.handlers.onCellUpdated?.(
            updated.cellAddress,
            {
              value: updated.value,
              displayValue: updated.displayValue,
              formula: updated.formula,
              style: updated.style,
            },
            updated.userId,
            updated.userName
          );
          break;
        }
        case 'CELL_UNLOCKED': {
          const unlocked = data.payload as { cellAddress: string; userId: string };
          this.handlers.onCellUnlocked?.(unlocked.cellAddress, unlocked.userId);
          break;
        }
        case 'USER_JOINED': {
          const joined = data.payload as { userId: string; userName: string };
          this.handlers.onUserJoined?.(joined.userId, joined.userName);
          break;
        }
        case 'USER_LEFT': {
          const left = data.payload as { userId: string; userName: string };
          this.handlers.onUserLeft?.(left.userId, left.userName);
          break;
        }
        case 'ERROR': {
          const error = data.payload as { message: string };
          this.handlers.onError?.(error.message);
          break;
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  requestCellLock(cellAddress: string): void {
    if (!this.client.active || !this.spreadsheetId) return;

    const userId = storage.getUserId?.();
    const userName = storage.getUserName?.();

    this.client.publish({
      destination: `/app/spreadsheet/${this.spreadsheetId}/lock`,
      body: JSON.stringify({
        cellAddress,
        userId: userId ? String(userId) : '',
        userName: userName || 'Anonymous',
      }),
    });
  }

  updateCell(cellAddress: string, value: string | null, formula: string | null, style?: CellStyle | null): void {
    if (!this.client.active || !this.spreadsheetId) return;

    const userId = storage.getUserId?.();
    const userName = storage.getUserName?.();

    this.client.publish({
      destination: `/app/spreadsheet/${this.spreadsheetId}/update`,
      body: JSON.stringify({
        cellAddress,
        value,
        formula,
        displayValue: value,
        style,
        userId: userId ? String(userId) : '',
        userName: userName || 'Anonymous',
      }),
    });
  }

  releaseCellLock(cellAddress: string): void {
    if (!this.client.active || !this.spreadsheetId) return;

    const userId = storage.getUserId?.();
    const userName = storage.getUserName?.();

    this.client.publish({
      destination: `/app/spreadsheet/${this.spreadsheetId}/unlock`,
      body: JSON.stringify({
        cellAddress,
        userId: userId ? String(userId) : '',
        userName: userName || 'Anonymous',
      }),
    });
  }

  refreshCellLock(cellAddress: string): void {
    if (!this.client.active || !this.spreadsheetId) return;

    const userId = storage.getUserId?.();
    const userName = storage.getUserName?.();

    this.client.publish({
      destination: `/app/spreadsheet/${this.spreadsheetId}/refresh-lock`,
      body: JSON.stringify({
        cellAddress,
        userId: userId ? String(userId) : '',
        userName: userName || 'Anonymous',
      }),
    });
  }

  isConnected(): boolean {
    return this.client.active;
  }
}

// Singleton instance
let wsClientInstance: SpreadsheetWebSocketClient | null = null;

export function getSpreadsheetWebSocketClient(): SpreadsheetWebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new SpreadsheetWebSocketClient();
  }
  return wsClientInstance;
}
