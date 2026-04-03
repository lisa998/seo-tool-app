// mocks/handlers/siteExplorer.ts
import {delay, http, HttpResponse} from 'msw'
import {requireAuth} from '../utils/auth'
import {checkRateLimit} from '../utils/rateLimit'
import {maybeError} from '../utils/errorInjection'
import {getIntParam, getParam, paginateWithCursor, sortItems} from '../utils/pagination'
import {
    DOMAIN_PROFILES,
    getAnchors,
    getBacklinks,
    getBrokenLinks,
    getReferringDomains,
    PRIMARY_DOMAIN,
} from '../factories/dataStore'
import {AnchorItem, Backlink, ReferringDomain} from "~/mocks/types";

export const siteExplorerHandlers = [
    // ─── GET /api/site-explorer/overview ─────────────────────
    // 考點：asyncData 首屏 + sparkline 與主指標一起回傳
    http.get('*/api/site-explorer/overview', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const rateErr = checkRateLimit('se-overview')
        if (rateErr) return rateErr
        const err = maybeError()
        if (err) return err

        await delay(150)

        const url = new URL(request.url)
        const domain = url.searchParams.get('domain') ?? PRIMARY_DOMAIN
        const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN]

        // sparkline 使用 domain profile 的數值作為基數，確保跨 API 一致性
        const genSparkline = (base: number) =>
            Array.from({length: 6}, (_, i) =>
                Math.round(base * (0.85 + i * 0.03 + Math.random() * 0.02)),
            )

        return HttpResponse.json({
            domain,
            metrics: {
                domainRating: profile.domainRating,
                backlinks: profile.backlinks,
                referringDomains: profile.referringDomains,
                organicTraffic: profile.organicTraffic,
            },
            sparklines: {
                domainRating: genSparkline(profile.domainRating),
                backlinks: genSparkline(profile.backlinks),
                referringDomains: genSparkline(profile.referringDomains),
                organicTraffic: genSparkline(profile.organicTraffic),
            },
        })
    }),

    // ─── GET /api/site-explorer/backlinks ────────────────────
    // 考點：cursor pagination + virtual scroll + filter ↔ URL sync + appliedFilters
    http.get('*/api/site-explorer/backlinks', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const rateErr = checkRateLimit('se-backlinks')
        if (rateErr) return rateErr
        const err = maybeError()
        if (err) return err

        await delay('real') // 模擬真實延遲

        const url = new URL(request.url)
        const cursor = getParam(url, 'cursor')
        const limit = Math.min(getIntParam(url, 'limit', 100), 200)
        const sort = getParam(url, 'sort') ?? 'dr_desc'
        const drMin = getIntParam(url, 'drMin', 0)
        const drMax = getIntParam(url, 'drMax', 100)
        const linkType = getParam(url, 'linkType') ?? 'all'
        const platform = getParam(url, 'platform') ?? 'all'
        const search = getParam(url, 'search')

        // 篩選
        let items = getBacklinks()
        if (drMin > 0) items = items.filter((b) => b.sourceDR >= drMin)
        if (drMax < 100) items = items.filter((b) => b.sourceDR <= drMax)
        if (linkType !== 'all') items = items.filter((b) => b.linkType === linkType)
        if (platform !== 'all') items = items.filter((b) => b.platform === platform)
        if (search) {
            const q = search.toLowerCase()
            items = items.filter(
                (b) =>
                    b.sourceUrl.toLowerCase().includes(q) ||
                    b.anchor.toLowerCase().includes(q),
            )
        }

        // 排序
        const fieldMap: Record<string, keyof Backlink> = {
            dr: 'sourceDR', ur: 'sourceUR', traffic: 'traffic', firstSeen: 'firstSeen',
        }
        items = sortItems(items, sort, fieldMap)

        // 分頁
        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (b) => b.id,
        )

        return HttpResponse.json({
            data: page,
            pagination: {cursor: nextCursor, hasMore, total},
            appliedFilters: {linkType, drMin, drMax, platform, sort},
        })
    }),

    // ─── GET /api/site-explorer/referring-domains ────────────
    http.get('*/api/site-explorer/referring-domains', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const err = maybeError()
        if (err) return err

        await delay('real')

        const url = new URL(request.url)
        const cursor = getParam(url, 'cursor')
        const limit = Math.min(getIntParam(url, 'limit', 100), 200)
        const sort = getParam(url, 'sort') ?? 'domainRating_desc'
        const drMin = getIntParam(url, 'drMin', 0)

        let items = getReferringDomains()
        if (drMin > 0) items = items.filter((r) => r.domainRating >= drMin)

        const fieldMap: Record<string, keyof ReferringDomain> = {
            domainRating: 'domainRating', backlinksCount: 'backlinksCount',
            firstSeen: 'firstSeen',
        }
        items = sortItems(items, sort, fieldMap)

        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (r) => r.id,
        )

        return HttpResponse.json({
            data: page,
            pagination: {cursor: nextCursor, hasMore, total},
        })
    }),

    // ─── GET /api/site-explorer/anchors ──────────────────────
    http.get('*/api/site-explorer/anchors', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        await delay('real')

        const url = new URL(request.url)
        const cursor = getParam(url, 'cursor')
        const limit = getIntParam(url, 'limit', 100)
        const sort = getParam(url, 'sort') ?? 'referringDomains_desc'

        let items = getAnchors()
        const fieldMap: Record<string, keyof AnchorItem> = {
            referringDomains: 'referringDomains', backlinks: 'backlinks',
            traffic: 'traffic',
        }
        items = sortItems(items, sort, fieldMap)

        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (a) => a.anchor, // 用 anchor 作為 id
        )

        return HttpResponse.json({
            data: page,
            pagination: {cursor: nextCursor, hasMore, total},
        })
    }),

    // ─── GET /api/site-explorer/broken-links ─────────────────
    http.get('*/api/site-explorer/broken-links', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        await delay('real')

        const url = new URL(request.url)
        const cursor = getParam(url, 'cursor')
        const limit = getIntParam(url, 'limit', 100)
        const httpCode = getParam(url, 'httpCode')

        let items = getBrokenLinks()
        if (httpCode && httpCode !== 'all') {
            items = items.filter((b) => b.httpCode === parseInt(httpCode, 10))
        }

        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (b) => b.targetUrl,
        )

        return HttpResponse.json({
            data: page,
            pagination: {cursor: nextCursor, hasMore, total},
        })
    }),
]