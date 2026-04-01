// mocks/handlers/competitive.ts
import {delay, http, HttpResponse} from 'msw'
import {requireAuth} from '../utils/auth'
import {maybeError} from '../utils/errorInjection'
import {getIntParam, getParam, paginateWithCursor} from '../utils/pagination'
import {
    DOMAIN_PROFILES,
    DOMAINS,
    getDashboardConfig,
    getGapKeywords,
    PRIMARY_DOMAIN,
    setDashboardConfig,
    SOURCE_TYPES,
} from '../factories/dataStore'
import type {DashboardConfig} from '../types'
import {faker} from '@faker-js/faker'

const COLORS: Record<string, string> = {
    'mysite.com': '#3b82f6',
    'competitor-a.com': '#ef4444',
    'competitor-b.com': '#10b981',
    'competitor-c.com': '#f59e0b',
}

export const competitiveHandlers = [
    // ─── GET /api/competitive/compare ────────────────────────
    // 考點：雷達圖 + 表格同步顯示 + 多 domain 並行請求
    http.get('/api/competitive/compare', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const err = maybeError()
        if (err) return err

        await delay(250)

        const url = new URL(request.url)
        const domainsParam = getParam(url, 'domains') ?? DOMAINS.join(',')
        const domainList = domainsParam.split(',')

        const metrics = ['domainRating', 'organicTraffic', 'backlinks', 'referringDomains', 'keywords']

        // 基於 DOMAIN_PROFILES 計算排名（一致性）
        const comparisons = domainList.map((domain) => {
            const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN]
            const metricValues: Record<string, { value: number; rank: number }> = {}

            for (const m of metrics) {
                const val = (profile as any)[m] ?? faker.number.int({min: 100, max: 10000})
                metricValues[m] = {value: val, rank: 0} // rank 稍後計算
            }

            return {domain, metrics: metricValues}
        })

        // 計算排名
        for (const m of metrics) {
            const sorted = [...comparisons].sort(
                (a, b) => b.metrics[m].value - a.metrics[m].value,
            )
            sorted.forEach((c, i) => {
                c.metrics[m].rank = i + 1
            })
        }

        return HttpResponse.json({comparisons})
    }),

    // ─── GET /api/competitive/traffic-overlay ────────────────
    // 考點：多系列折線圖疊加 + normalize toggle + 時間區間聯動
    http.get('/api/competitive/traffic-overlay', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(300)

        const url = new URL(request.url)
        const domainsParam = getParam(url, 'domains') ?? DOMAINS.join(',')
        const range = getParam(url, 'range') ?? '6m'
        const normalize = getParam(url, 'normalize') === 'true'
        const domainList = domainsParam.split(',')

        const pointCount = range === '1y' ? 52 : range === '3m' ? 13 : 26
        const now = Date.now()

        const series = domainList.map((domain) => {
            const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN]
            const base = profile.organicTraffic

            const dataPoints = Array.from({length: pointCount}, (_, i) => {
                const value = Math.round(base * (0.85 + i * (0.15 / pointCount) + (Math.random() - 0.5) * 0.05))
                return {
                    date: new Date(now - (pointCount - i) * 604800000).toISOString().slice(0, 10),
                    value,
                    normalized: normalize ? Math.round((value / base) * 100) : value,
                }
            })

            return {
                domain,
                color: COLORS[domain] ?? '#6b7280',
                dataPoints,
            }
        })

        return HttpResponse.json({series})
    }),

    // ─── GET /api/competitive/keyword-gap ────────────────────
    // 考點：大量資料 cursor pagination + 複雜篩選 + 前端 virtual table
    http.get('/api/competitive/keyword-gap', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay('real')

        const url = new URL(request.url)
        const cursor = getParam(url, 'cursor')
        const limit = getIntParam(url, 'limit', 50)
        const gapType = getParam(url, 'gapType') ?? 'all'
        const diffMin = getIntParam(url, 'difficultyMin', 0)
        const diffMax = getIntParam(url, 'difficultyMax', 100)
        const volMin = getIntParam(url, 'volumeMin', 0)

        let items = getGapKeywords()

        // Gap type 篩選
        if (gapType === 'missing') {
            items = items.filter((k) => k.myPosition === null)
        } else if (gapType === 'weak') {
            items = items.filter((k) => {
                if (k.myPosition === null) return false
                return Object.values(k.competitorPositions).some(
                    (p) => p !== null && p < k.myPosition!,
                )
            })
        } else if (gapType === 'untapped') {
            items = items.filter((k) =>
                k.myPosition === null &&
                Object.values(k.competitorPositions).filter((p) => p !== null).length >= 2,
            )
        }

        // 篩選
        if (diffMin > 0) items = items.filter((k) => k.difficulty >= diffMin)
        if (diffMax < 100) items = items.filter((k) => k.difficulty <= diffMax)
        if (volMin > 0) items = items.filter((k) => k.volume >= volMin)

        // 預設按 volume 降序
        items = [...items].sort((a, b) => b.volume - a.volume)

        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (k) => k.keyword,
        )

        return HttpResponse.json({
            data: page,
            pagination: {cursor: nextCursor, hasMore, total},
        })
    }),

    // ─── GET /api/competitive/backlink-sources ───────────────
    // 考點：矩陣圖（heatmap）— 多 domain 多 source 的交叉表
    http.get('/api/competitive/backlink-sources', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(250)

        const url = new URL(request.url)
        const domainsParam = getParam(url, 'domains') ?? DOMAINS.join(',')
        const domainList = domainsParam.split(',')

        const matrix = domainList.map((domain) => {
            const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN]
            const totalBl = profile.backlinks
            const counts: Record<string, number> = {}
            const types = [...SOURCE_TYPES]
            let remaining = totalBl
            for (let i = 0; i < types.length; i++) {
                const val = i < types.length - 1
                    ? Math.round(remaining * faker.number.float({min: 0.1, max: 0.4}))
                    : remaining
                counts[types[i]] = Math.max(0, val)
                remaining -= val
            }
            return {domain, counts}
        })

        return HttpResponse.json({matrix})
    }),

    // ─── GET /api/competitive/content-velocity ───────────────
    // 考點：stacked bar chart + 月份粒度
    http.get('/api/competitive/content-velocity', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(200)

        const url = new URL(request.url)
        const domainsParam = getParam(url, 'domains') ?? DOMAINS.join(',')
        const domainList = domainsParam.split(',')
        const now = new Date()

        const months = Array.from({length: 6}, (_, i) => {
            const d = new Date(now)
            d.setMonth(d.getMonth() - (5 - i))
            const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const counts: Record<string, number> = {}
            for (const domain of domainList) {
                counts[domain] = faker.number.int({min: 5, max: 80})
            }
            return {month, counts}
        })

        return HttpResponse.json({months})
    }),

    // ─── GET /api/competitive/market-share ───────────────────
    // 考點：treemap / sunburst 視覺化 + 可下鑽（children）
    http.get('/api/competitive/market-share', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(200)

        const domainsParam = new URL(request.url).searchParams.get('domains') ?? DOMAINS.join(',')
        const domainList = domainsParam.split(',')
        const categories = ['Blog', 'Tools', 'Landing Pages', 'Resources', 'API Docs']

        let remainingShare = 100
        const segments = domainList.map((domain, idx) => {
            const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN]
            const share = idx < domainList.length - 1
                ? faker.number.float({min: 8, max: 40, fractionDigits: 1})
                : Math.max(0, remainingShare)
            remainingShare -= share

            return {
                domain,
                share,
                keywords: profile.keywords,
                children: categories.map((cat) => ({
                    category: cat,
                    share: faker.number.float({min: 1, max: share * 0.5, fractionDigits: 1}),
                    keywords: faker.number.int({min: 50, max: 1000}),
                })),
            }
        })

        return HttpResponse.json({segments})
    }),

    // ─── GET /api/competitive/dashboard-config ───────────────
    http.get('/api/competitive/dashboard-config', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(100)

        return HttpResponse.json(getDashboardConfig())
    }),

    // ─── PUT /api/competitive/dashboard-config ───────────────
    // 考點：PUT + debounced auto-save + optimistic update
    http.put('/api/competitive/dashboard-config', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(300)

        const err = maybeError(0.03)
        if (err) return err

        const body = (await request.json()) as DashboardConfig
        setDashboardConfig(body)

        return HttpResponse.json({success: true, savedAt: new Date().toISOString()})
    }),
]