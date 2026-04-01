// mocks/ws/editorMock.ts
// WebSocket Mock for Collaborative Editor
//
// 使用 mock-socket 庫模擬 WebSocket server
// npm install mock-socket --save-dev
//
// 考點：
// 1. WebSocket 連線生命週期（open / message / close / error）
// 2. 多使用者 cursor 位置同步
// 3. 即時打字內容廣播（OT / CRDT 概念簡化版）
// 4. 使用者上線 / 離線通知
// 5. 心跳偵測（ping/pong）
// 6. 斷線重連策略

import {Server as MockServer, Client} from 'mock-socket'
import {MOCK_USERS} from '../factories/dataStore'
import {faker} from '@faker-js/faker'

// ─── Types ────────────────────────────────────────────────
interface WsMessage {
    type: string
    payload: Record<string, unknown>
}

interface ConnectedUser {
    id: string
    name: string
    avatar: string
    color: string
    cursor?: { line: number; ch: number }
    selection?: { from: { line: number; ch: number }; to: { line: number; ch: number } }
    lastActivity: number
}

// ─── State ────────────────────────────────────────────────
const WS_URL = 'ws://localhost:3000/api/editor/connect'
let mockServer: MockServer | null = null
const connectedUsers = new Map<Client, ConnectedUser>()

const CURSOR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
let colorIndex = 0

// ─── Init ─────────────────────────────────────────────────
export function initEditorWebSocket(): void {
    // 避免重複初始化
    if (mockServer) {
        mockServer.close()
    }

    mockServer = new MockServer(WS_URL)

    mockServer.on('connection', (socket: Client) => {
        // 模擬連線延遲
        const userId = `user_${faker.string.alphanumeric(6)}`
        const mockUser = faker.helpers.arrayElement(MOCK_USERS)
        const color = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length]
        colorIndex++

        const user: ConnectedUser = {
            id: userId,
            name: mockUser.name,
            avatar: mockUser.avatar,
            color,
            lastActivity: Date.now(),
        }

        connectedUsers.set(socket, user)

        // ─── 1. 連線確認 + 目前在線使用者 ────────────────
        send(socket, {
            type: 'connected',
            payload: {
                userId,
                user: {name: user.name, avatar: user.avatar, color: user.color},
                activeUsers: Array.from(connectedUsers.values()).map((u) => ({
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar,
                    color: u.color,
                    cursor: u.cursor,
                })),
            },
        })

        // ─── 2. 廣播新使用者上線 ──────────────────────────
        broadcast(
            {
                type: 'user_joined',
                payload: {
                    userId,
                    name: user.name,
                    avatar: user.avatar,
                    color: user.color,
                },
            },
            socket,
        )

        // ─── 3. 訊息處理 ─────────────────────────────────
        socket.onmessage = (event: MessageEvent) => {
            try {
                const msg: WsMessage = JSON.parse(event.data as string)
                const currentUser = connectedUsers.get(socket)
                if (!currentUser) return

                currentUser.lastActivity = Date.now()

                switch (msg.type) {
                    // 心跳
                    case 'ping':
                        send(socket, {type: 'pong', payload: {timestamp: Date.now()}})
                        break

                    // Cursor 位置更新
                    case 'cursor_move':
                        currentUser.cursor = msg.payload.cursor as ConnectedUser['cursor']
                        broadcast(
                            {
                                type: 'cursor_update',
                                payload: {
                                    userId: currentUser.id,
                                    name: currentUser.name,
                                    color: currentUser.color,
                                    cursor: currentUser.cursor,
                                },
                            },
                            socket,
                        )
                        break

                    // 選取範圍更新
                    case 'selection_change':
                        currentUser.selection = msg.payload.selection as ConnectedUser['selection']
                        broadcast(
                            {
                                type: 'selection_update',
                                payload: {
                                    userId: currentUser.id,
                                    color: currentUser.color,
                                    selection: currentUser.selection,
                                },
                            },
                            socket,
                        )
                        break

                    // 內容變更（簡化版 OT）
                    case 'content_change':
                        // 模擬 server 處理延遲
                        setTimeout(() => {
                            // 回傳確認（帶 server timestamp 作為版本控制）
                            send(socket, {
                                type: 'change_ack',
                                payload: {
                                    changeId: msg.payload.changeId,
                                    serverTimestamp: Date.now(),
                                    version: (msg.payload.version as number ?? 0) + 1,
                                },
                            })

                            // 廣播給其他使用者
                            broadcast(
                                {
                                    type: 'remote_change',
                                    payload: {
                                        userId: currentUser.id,
                                        name: currentUser.name,
                                        changeId: msg.payload.changeId,
                                        operations: msg.payload.operations,
                                        serverTimestamp: Date.now(),
                                    },
                                },
                                socket,
                            )
                        }, 50 + Math.random() * 100)
                        break

                    // 鎖定區塊（防止衝突）
                    case 'lock_block':
                        broadcast(
                            {
                                type: 'block_locked',
                                payload: {
                                    blockId: msg.payload.blockId,
                                    lockedBy: {id: currentUser.id, name: currentUser.name, color: currentUser.color},
                                },
                            },
                            socket,
                        )
                        // 30 秒後自動解鎖
                        setTimeout(() => {
                            broadcast({
                                type: 'block_unlocked',
                                payload: {blockId: msg.payload.blockId},
                            })
                        }, 30000)
                        break

                    case 'unlock_block':
                        broadcast({
                            type: 'block_unlocked',
                            payload: {blockId: msg.payload.blockId},
                        })
                        break

                    default:
                        send(socket, {
                            type: 'error',
                            payload: {message: `Unknown message type: ${msg.type}`},
                        })
                }
            } catch (err) {
                send(socket, {
                    type: 'error',
                    payload: {message: 'Invalid message format'},
                })
            }
        }

        // ─── 4. 斷線處理 ─────────────────────────────────
        socket.onclose = () => {
            const disconnectedUser = connectedUsers.get(socket)
            connectedUsers.delete(socket)

            if (disconnectedUser) {
                broadcast({
                    type: 'user_left',
                    payload: {
                        userId: disconnectedUser.id,
                        name: disconnectedUser.name,
                    },
                })
            }
        }

        // ─── 5. 模擬其他使用者活動 ───────────────────────
        // 每 3-8 秒模擬一個 bot 使用者的 cursor 移動
        const botInterval = setInterval(() => {
            if (connectedUsers.size <= 1) return

            const botUser = {
                userId: 'bot_collaborator',
                name: MOCK_USERS[1].name,
                color: '#8b5cf6',
                cursor: {
                    line: faker.number.int({min: 0, max: 30}),
                    ch: faker.number.int({min: 0, max: 80}),
                },
            }

            send(socket, {
                type: 'cursor_update',
                payload: botUser,
            })

            // 偶爾模擬 bot 打字
            if (Math.random() < 0.3) {
                send(socket, {
                    type: 'remote_change',
                    payload: {
                        userId: 'bot_collaborator',
                        name: MOCK_USERS[1].name,
                        changeId: `bot_${Date.now()}`,
                        operations: [
                            {
                                type: 'insert',
                                position: botUser.cursor,
                                text: faker.lorem.words({min: 1, max: 3}),
                            },
                        ],
                        serverTimestamp: Date.now(),
                    },
                })
            }
        }, faker.number.int({min: 3000, max: 8000}))

        // 清理 interval
        socket.addEventListener('close', () => clearInterval(botInterval))
    })
}

// ─── Helpers ──────────────────────────────────────────────
function send(socket: Client, msg: WsMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg))
    }
}

function broadcast(msg: WsMessage, exclude?: Client): void {
    connectedUsers.forEach((_, ws) => {
        if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg))
        }
    })
}

/**
 * 關閉 WebSocket Mock Server
 * 用於測試清理或 HMR
 */
export function destroyEditorWebSocket(): void {
    if (mockServer) {
        mockServer.close()
        mockServer = null
        connectedUsers.clear()
        colorIndex = 0
    }
}