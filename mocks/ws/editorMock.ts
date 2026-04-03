// mocks/ws/editorMock.ts
// WebSocket Mock for Collaborative Editor
//
// 使用 MSW 內建的 WebSocket 攔截功能（ws.link）
// 不再依賴 mock-socket，browser / server 兩端共用同一組 handler
//
// 考點：
// 1. WebSocket 連線生命週期（open / message / close / error）
// 2. 多使用者 cursor 位置同步
// 3. 即時打字內容廣播（OT / CRDT 概念簡化版）
// 4. 使用者上線 / 離線通知
// 5. 心跳偵測（ping/pong）
// 6. 斷線重連策略

import { ws } from 'msw';
import { MOCK_USERS } from '../factories/dataStore';
import { faker } from '@faker-js/faker';

// ─── Types ────────────────────────────────────────────────
interface WsMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface ConnectedUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { line: number; ch: number };
  selection?: { from: { line: number; ch: number }; to: { line: number; ch: number } };
  lastActivity: number;
}

// ─── State ────────────────────────────────────────────────
const CURSOR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
let colorIndex = 0;

// 以 client 物件為 key，追蹤每個連線對應的使用者資料
const connectedUsers = new Map<object, ConnectedUser>();

// ─── WebSocket Link ──────────────────────────────────────
export const editorWs = ws.link('ws://localhost:3000/api/editor/connect');

/**
 * WebSocket handler — 直接加入 MSW handlers 陣列即可
 * browser 端由 setupWorker 攔截、server 端由 setupServer 攔截
 */
export const editorWsHandler = editorWs.addEventListener('connection', ({ client }) => {
  const userId = `user_${faker.string.alphanumeric(6)}`;
  const mockUser = faker.helpers.arrayElement(MOCK_USERS);
  const color = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
  colorIndex++;

  const user: ConnectedUser = {
    id: userId,
    name: mockUser.name,
    avatar: mockUser.avatar,
    color,
    lastActivity: Date.now(),
  };

  connectedUsers.set(client, user);

  // ─── 1. 連線確認 + 目前在線使用者 ────────────────
  client.send(
    JSON.stringify({
      type: 'connected',
      payload: {
        userId,
        user: { name: user.name, avatar: user.avatar, color: user.color },
        activeUsers: Array.from(connectedUsers.values()).map((u) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          color: u.color,
          cursor: u.cursor,
        })),
      },
    }),
  );

  // ─── 2. 廣播新使用者上線 ──────────────────────────
  editorWs.broadcastExcept(
    client,
    JSON.stringify({
      type: 'user_joined',
      payload: {
        userId,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
      },
    }),
  );

  // ─── 3. 訊息處理 ─────────────────────────────────
  client.addEventListener('message', (event) => {
    try {
      const msg: WsMessage = JSON.parse(event.data as string);
      const currentUser = connectedUsers.get(client);
      if (!currentUser) return;

      currentUser.lastActivity = Date.now();

      switch (msg.type) {
        // 心跳
        case 'ping':
          client.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
          break;

        // Cursor 位置更新
        case 'cursor_move':
          currentUser.cursor = msg.payload.cursor as ConnectedUser['cursor'];
          editorWs.broadcastExcept(
            client,
            JSON.stringify({
              type: 'cursor_update',
              payload: {
                userId: currentUser.id,
                name: currentUser.name,
                color: currentUser.color,
                cursor: currentUser.cursor,
              },
            }),
          );
          break;

        // 選取範圍更新
        case 'selection_change':
          currentUser.selection = msg.payload.selection as ConnectedUser['selection'];
          editorWs.broadcastExcept(
            client,
            JSON.stringify({
              type: 'selection_update',
              payload: {
                userId: currentUser.id,
                color: currentUser.color,
                selection: currentUser.selection,
              },
            }),
          );
          break;

        // 內容變更（簡化版 OT）
        case 'content_change':
          // 模擬 server 處理延遲
          setTimeout(
            () => {
              // 回傳確認（帶 server timestamp 作為版本控制）
              client.send(
                JSON.stringify({
                  type: 'change_ack',
                  payload: {
                    changeId: msg.payload.changeId,
                    serverTimestamp: Date.now(),
                    version: ((msg.payload.version as number) ?? 0) + 1,
                  },
                }),
              );

              // 廣播給其他使用者
              editorWs.broadcastExcept(
                client,
                JSON.stringify({
                  type: 'remote_change',
                  payload: {
                    userId: currentUser.id,
                    name: currentUser.name,
                    changeId: msg.payload.changeId,
                    operations: msg.payload.operations,
                    serverTimestamp: Date.now(),
                  },
                }),
              );
            },
            50 + Math.random() * 100,
          );
          break;

        // 鎖定區塊（防止衝突）
        case 'lock_block':
          editorWs.broadcastExcept(
            client,
            JSON.stringify({
              type: 'block_locked',
              payload: {
                blockId: msg.payload.blockId,
                lockedBy: { id: currentUser.id, name: currentUser.name, color: currentUser.color },
              },
            }),
          );
          // 30 秒後自動解鎖
          setTimeout(() => {
            editorWs.broadcast(
              JSON.stringify({
                type: 'block_unlocked',
                payload: { blockId: msg.payload.blockId },
              }),
            );
          }, 30000);
          break;

        case 'unlock_block':
          editorWs.broadcast(
            JSON.stringify({
              type: 'block_unlocked',
              payload: { blockId: msg.payload.blockId },
            }),
          );
          break;

        default:
          client.send(
            JSON.stringify({
              type: 'error',
              payload: { message: `Unknown message type: ${msg.type}` },
            }),
          );
      }
    } catch (err) {
      client.send(
        JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' },
        }),
      );
    }
  });

  // ─── 4. 斷線處理 ─────────────────────────────────
  client.addEventListener('close', () => {
    const disconnectedUser = connectedUsers.get(client);
    connectedUsers.delete(client);

    if (disconnectedUser) {
      editorWs.broadcast(
        JSON.stringify({
          type: 'user_left',
          payload: {
            userId: disconnectedUser.id,
            name: disconnectedUser.name,
          },
        }),
      );
    }

    clearInterval(botInterval);
  });

  // ─── 5. 模擬其他使用者活動 ───────────────────────
  // 每 3-8 秒模擬一個 bot 使用者的 cursor 移動
  const botInterval = setInterval(
    () => {
      if (connectedUsers.size <= 1) return;

      const botUser = {
        userId: 'bot_collaborator',
        name: MOCK_USERS[1].name,
        color: '#8b5cf6',
        cursor: {
          line: faker.number.int({ min: 0, max: 30 }),
          ch: faker.number.int({ min: 0, max: 80 }),
        },
      };

      client.send(
        JSON.stringify({
          type: 'cursor_update',
          payload: botUser,
        }),
      );

      // 偶爾模擬 bot 打字
      if (Math.random() < 0.3) {
        client.send(
          JSON.stringify({
            type: 'remote_change',
            payload: {
              userId: 'bot_collaborator',
              name: MOCK_USERS[1].name,
              changeId: `bot_${Date.now()}`,
              operations: [
                {
                  type: 'insert',
                  position: botUser.cursor,
                  text: faker.lorem.words({ min: 1, max: 3 }),
                },
              ],
              serverTimestamp: Date.now(),
            },
          }),
        );
      }
    },
    faker.number.int({ min: 3000, max: 8000 }),
  );
});
