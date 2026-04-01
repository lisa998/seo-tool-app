import {handlers} from './handlers'
import {setupWorker} from "msw/browser";

/**
 * MSW Browser Worker
 *
 * 使用方式：
 * - 由 Nuxt 2 plugin (plugins/msw.client.ts) 在 client-side 啟動
 * - 開發環境中攔截所有 /api/* 請求
 *
 * 注意事項：
 * - msw@2.x 的 setupWorker 從 'msw/browser' 匯入（非 'msw'）
 * - 需要先執行 `npx msw init static/` 產生 mockServiceWorker.js
 *   （Nuxt 2 的靜態資源目錄是 static/，不是 public/）
 */
export const worker = setupWorker(...handlers)

// 可選：匯出 handlers 方便動態增減
export {handlers}