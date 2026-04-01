// plugins/msw.client.ts
// Nuxt 2 Plugin — client-side only (ssr: false)
//
// nuxt.config.ts 設定：
// plugins: [
//   { src: '~/plugins/msw.client.ts', mode: 'client' },
// ]

import type {Plugin} from '@nuxt/types'

/**
 * Nuxt 2 MSW Plugin
 *
 * 設計考量：
 * 1. 僅在開發環境啟動（NODE_ENV === 'development'）
 * 2. 使用動態 import 確保 production build 不包含 MSW 程式碼
 * 3. ssr: false — 只在瀏覽器端執行
 * 4. Service Worker 檔案路徑對應 Nuxt 2 的 static/ 目錄
 *
 * 前置步驟：
 * ```bash
 * # 1. 安裝依賴
 * npm install msw@2 @faker-js/faker --save-dev
 *
 * # 2. 產生 Service Worker 檔案到 Nuxt 2 靜態目錄
 * npx msw init static/ --save
 *
 * # 3. 確認 static/mockServiceWorker.js 存在
 * ```
 */
const mswPlugin: Plugin = async (context) => {
    // 僅開發環境啟動
    if (process.env.NODE_ENV !== 'development') return

    // 避免 SSR 端執行
    if (typeof window === 'undefined') return
    try {
        // 動態載入，確保 tree-shaking 在 production 生效
        const {worker} = await import('~/mocks/browser')

        console.log(worker)

        worker.start({
            // Service Worker 路徑（相對於 Nuxt 2 的 static/ 目錄）
            serviceWorker: {
                url: '/mockServiceWorker.js',
            },

            // 只攔截 /api/* 的請求，其他請求直接放行
            onUnhandledRequest(request, print) {
                const url = new URL(request.url)
                if (url.pathname.startsWith('/api/')) {
                    print.warning()
                }
                // 非 API 請求靜默放行
            },

            // 安靜模式：減少 console 輸出
            quiet: false,
        })

        console.log(
            '%c[MSW] Mock Service Worker 已啟動 🎯',
            'color: #10b981; font-weight: bold;',
        )
        console.log(
            '%c[MSW] 攔截中的 API 路徑: /api/*',
            'color: #6b7280;',
        )

        // 🔧 同時啟動 WebSocket mock（collaborative editor）
        const {initEditorWebSocket} = await import('~/mocks/ws/editorMock')
        initEditorWebSocket()
        console.log(
            '%c[MSW] WebSocket Mock (Collaborative Editor) 已啟動 🔌',
            'color: #3b82f6; font-weight: bold;',
        )
    } catch (error) {
        console.error('[MSW] 啟動失敗:', error)
    }
}

export default mswPlugin