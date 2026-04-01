import {http, passthrough} from 'msw'
import {authHandlers} from './auth'
import {siteExplorerHandlers} from './siteExplorer'
import {domainOverviewHandlers} from './domainOverview'
import {keywordHandlers} from './keyword'
import {auditHandlers} from './audit'
import {rankTrackerHandlers} from './rankTracker'
import {contentHandlers} from './content'
import {competitiveHandlers} from './competitive'
import {contentGenHandlers} from './contentGen'

/**
 * 所有 MSW handler 的統一入口
 * 順序無關緊要，MSW 會根據 method + path 匹配
 * 若有重複 path 則先定義者優先
 * 最後的 catch-all 確保未 mock 的請求直接 passthrough，不影響 Nuxt 內部機制
 */
export const handlers = [
    ...authHandlers,
    ...siteExplorerHandlers,
    ...domainOverviewHandlers,
    ...keywordHandlers,
    ...auditHandlers,
    ...rankTrackerHandlers,
    ...contentHandlers,
    ...competitiveHandlers,
    ...contentGenHandlers,

    // Catch-all: 未被上方 handler 匹配的請求直接放行
    http.all('*', () => passthrough()),
]

// 方便個別模組獨立測試
export {
    authHandlers,
    siteExplorerHandlers,
    domainOverviewHandlers,
    keywordHandlers,
    auditHandlers,
    rankTrackerHandlers,
    contentHandlers,
    competitiveHandlers,
    contentGenHandlers,
}