// mocks/handlers/keyword.ts
import {delay, http, HttpResponse} from 'msw'
import {requireAuth} from '../utils/auth'
import {maybeError} from '../utils/errorInjection'
import {SERP_FEATURES} from '../factories/dataStore'
import {faker} from '@faker-js/faker'

// ─── Autocomplete 假資料（per db，確保一致性）──────────────
const AUTOCOMPLETE_DB: Record<string, Array<{ keyword: string; volume: number; difficulty: number }>> = {
    us: [
        {keyword: 'seo tools', volume: 74000, difficulty: 78},
        {keyword: 'seo audit', volume: 22000, difficulty: 55},
        {keyword: 'seo checker online', volume: 14000, difficulty: 42},
        {keyword: 'seo meaning', volume: 90000, difficulty: 35},
        {keyword: 'seo optimization', volume: 33000, difficulty: 67},
        {keyword: 'seo agency', volume: 12000, difficulty: 72},
        {keyword: 'seo best practices 2024', volume: 8100, difficulty: 48},
        {keyword: 'seo marketing', volume: 27000, difficulty: 61},
    ],
    tw: [
        {keyword: 'seo 工具', volume: 2400, difficulty: 45},
        {keyword: 'seo 優化', volume: 5400, difficulty: 52},
        {keyword: 'seo 是什麼', volume: 8100, difficulty: 28},
        {keyword: 'seo 教學', volume: 3200, difficulty: 38},
        {keyword: 'seo 公司推薦', volume: 1900, difficulty: 55},
        {keyword: 'seo 關鍵字', volume: 2900, difficulty: 42},
        {keyword: 'seo 排名', volume: 1500, difficulty: 50},
        {keyword: 'seo 分析工具', volume: 880, difficulty: 35},
    ],
    jp: [
        {keyword: 'SEO ツール', volume: 6600, difficulty: 60},
        {keyword: 'SEO 対策', volume: 33000, difficulty: 68},
        {keyword: 'SEO とは', volume: 22000, difficulty: 30},
        {keyword: 'SEO チェック', volume: 4400, difficulty: 45},
        {keyword: 'SEO 会社', volume: 2400, difficulty: 58},
        {keyword: 'SEO キーワード', volume: 3600, difficulty: 42},
    ],
}

export const keywordHandlers = [
    // ─── GET /api/keyword/autocomplete ───────────────────────
    // 考點：debounce 300ms + AbortController + race condition（不同 db 延遲不同）
    http.get('*/api/keyword/autocomplete', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const url = new URL(request.url)
        const q = (url.searchParams.get('q') ?? '').toLowerCase()
        const db = url.searchParams.get('db') ?? 'us'
        const limit = parseInt(url.searchParams.get('limit') ?? '8')

        // 🎯 刻意不同 db 不同延遲 → 製造 race condition
        const delays: Record<string, number> = {tw: 100, us: 200, jp: 400}
        await delay(delays[db] ?? 200)

        if (q.length < 2) {
            return HttpResponse.json({query: q, db, suggestions: []})
        }

        const pool = AUTOCOMPLETE_DB[db] ?? AUTOCOMPLETE_DB['us']
        const suggestions = pool
            .filter((item) => item.keyword.toLowerCase().includes(q))
            .slice(0, limit)

        return HttpResponse.json({query: q, db, suggestions})
    }),

    // ─── GET /api/keyword/overview ───────────────────────────
    http.get('*/api/keyword/overview', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const err = maybeError()
        if (err) return err

        await delay(200)

        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword') ?? 'seo tools'
        const db = url.searchParams.get('db') ?? 'us'

        // 嘗試從 autocomplete DB 取得一致的資料
        const pool = AUTOCOMPLETE_DB[db] ?? AUTOCOMPLETE_DB['us']
        const match = pool.find((s) => s.keyword.toLowerCase() === keyword.toLowerCase())

        return HttpResponse.json({
            keyword,
            db,
            metrics: {
                volume: match?.volume ?? faker.number.int({min: 1000, max: 100000}),
                difficulty: match?.difficulty ?? faker.number.int({min: 10, max: 95}),
                cpc: faker.number.float({min: 0.5, max: 15, fractionDigits: 2}),
                clicks: faker.number.int({min: 500, max: 80000}),
                returnRate: faker.number.float({min: 1.0, max: 1.5, fractionDigits: 2}),
            },
        })
    }),

    // ─── GET /api/keyword/serp ──────────────────────────────
    http.get('*/api/keyword/serp', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        await delay(250)

        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword') ?? 'seo tools'

        const features = faker.helpers.arrayElements(
            [...SERP_FEATURES], {min: 2, max: 5},
        )

        return HttpResponse.json({
            keyword,
            serpFeatures: features,
            results: Array.from({length: 10}, (_, i) => ({
                position: i + 1,
                url: `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
                title: faker.lorem.sentence({min: 5, max: 10}),
                domainRating: faker.number.int({min: 30, max: 95}),
                urlRating: faker.number.int({min: 10, max: 85}),
                backlinks: faker.number.int({min: 100, max: 50000}),
                traffic: faker.number.int({min: 1000, max: 200000}),
                featuredSnippet: i === 0 && features.includes('featured_snippet'),
            })),
        })
    }),

    // ─── GET /api/keyword/volume-trend ──────────────────────
    http.get('*/api/keyword/volume-trend', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(180)

        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword') ?? 'seo tools'
        const db = url.searchParams.get('db') ?? 'us'
        const pool = AUTOCOMPLETE_DB[db] ?? AUTOCOMPLETE_DB['us']
        const match = pool.find((s) => s.keyword.toLowerCase() === keyword.toLowerCase())
        const baseVol = match?.volume ?? 50000

        const now = new Date()
        return HttpResponse.json({
            months: Array.from({length: 12}, (_, i) => {
                const d = new Date(now)
                d.setMonth(d.getMonth() - (11 - i))
                return {
                    month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                    volume: Math.round(baseVol * (0.8 + Math.random() * 0.4)),
                }
            }),
        })
    }),

    // ─── GET /api/keyword/serp-features-history ─────────────
    http.get('*/api/keyword/serp-features-history', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(200)

        const now = new Date()
        return HttpResponse.json({
            history: Array.from({length: 12}, (_, i) => {
                const d = new Date(now)
                d.setMonth(d.getMonth() - (11 - i))
                return {
                    date: d.toISOString().slice(0, 10),
                    features: faker.helpers.arrayElements([...SERP_FEATURES], {min: 2, max: 5}),
                }
            }),
        })
    }),
]