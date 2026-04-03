import type {Plugin} from '@nuxt/types'

const mswPlugin: Plugin = async (context) => {
    // 僅開發環境啟動
    if (process.env.NODE_ENV !== 'development') return

    // 避免 SSR 端執行
    if (typeof window === 'undefined') return
    try {
        // 動態載入，確保 tree-shaking 在 production 生效
        const {worker} = await import('~/mocks/browser')

        await worker.start({
            // Service Worker 路徑（相對於 Nuxt 2 的 static/ 目錄）
            serviceWorker: {
                url: '/mockServiceWorker.js',
            },
            onUnhandledRequest: 'bypass',
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
        console.log(
            '%c[MSW] WebSocket Mock (Collaborative Editor) 已啟動 🔌',
            'color: #3b82f6; font-weight: bold;',
        )
    } catch (error) {
        console.error('[MSW] 啟動失敗:', error)
    }
}

export default mswPlugin