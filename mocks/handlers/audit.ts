// mocks/handlers/audit.ts
import {delay, http, HttpResponse} from 'msw'
import {requireAuth} from '../utils/auth'
import {getIntParam, getParam, paginateWithCursor} from '../utils/pagination'
import {CATEGORIES, getAuditIssues, getUrlTree} from '../factories/dataStore'
import {faker} from '@faker-js/faker'

// 追蹤啟動的 audit（跨 API 一致性）
const activeAudits = new Map<string, {
    domain: string; maxPages: number; startedAt: number
}>()

export const auditHandlers = [
    // ─── POST /api/audit/start ──────────────────────────────
    // 考點：回 202 Accepted，streamUrl 告訴前端去哪裡收聽 SSE
    http.post('/api/audit/start', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        await delay(200)

        const body = (await request.json()) as {
            domain?: string; maxPages?: number
        }
        const domain = body.domain ?? 'example.com'
        const maxPages = body.maxPages ?? 5000
        const auditId = `audit_${faker.string.alphanumeric(6)}`

        activeAudits.set(auditId, {
            domain, maxPages, startedAt: Date.now(),
        })

        return HttpResponse.json(
            {
                auditId,
                status: 'started',
                estimatedDuration: Math.round(maxPages / 50),
                streamUrl: `/api/audit/stream/${auditId}`,
            },
            {status: 202},
        )
    }),

    // ─── GET /api/audit/stream/:auditId (SSE) ───────────────
    // 考點：SSE 即時推送 + 斷線重連 (Last-Event-ID) + EventSource 在 mounted 初始化
    http.get('/api/audit/stream/:auditId', ({params}) => {
        const auditId = params.auditId as string
        const audit = activeAudits.get(auditId)
        const totalPages = audit?.maxPages ?? 5000
        const encoder = new TextEncoder()
        let eventId = 0

        const stream = new ReadableStream({
            async start(controller) {
                let scanned = 0

                while (scanned < totalPages) {
                    scanned += Math.floor(Math.random() * 80) + 20
                    scanned = Math.min(scanned, totalPages)
                    eventId++

                    // progress 事件
                    const progressEvent =
                        `id: ${eventId}\n` +
                        `event: progress\n` +
                        `data: ${JSON.stringify({
                            pagesScanned: scanned,
                            totalPages,
                            speed: 40 + Math.floor(Math.random() * 10),
                            errors: Math.floor(scanned * 0.005),
                            warnings: Math.floor(scanned * 0.03),
                        })}\n\n`
                    controller.enqueue(encoder.encode(progressEvent))

                    // 隨機 issue_found 事件
                    if (Math.random() < 0.3) {
                        eventId++
                        const issueEvent =
                            `id: ${eventId}\n` +
                            `event: issue_found\n` +
                            `data: ${JSON.stringify({
                                type: Math.random() > 0.7 ? 'error' : 'warning',
                                category: faker.helpers.arrayElement([...CATEGORIES]),
                                rule: faker.helpers.arrayElement([
                                    'missing_h1', 'missing_meta', 'slow_page',
                                    'broken_link', 'thin_content', 'large_image',
                                ]),
                                url: `/page-${scanned}`,
                                message: faker.lorem.sentence(),
                            })}\n\n`
                        controller.enqueue(encoder.encode(issueEvent))
                    }

                    // 每 500ms 推送一次
                    await new Promise((r) => setTimeout(r, 500))
                }

                // complete 事件
                eventId++
                const completeEvent =
                    `id: ${eventId}\n` +
                    `event: complete\n` +
                    `data: ${JSON.stringify({
                        auditId,
                        totalPages,
                        totalErrors: 23,
                        totalWarnings: 147,
                        healthScore: 72,
                    })}\n\n`
                controller.enqueue(encoder.encode(completeEvent))
                controller.close()
            },
        })

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        })
    }),

    // ─── GET /api/audit/report/:auditId ─────────────────────
    http.get('/api/audit/report/:auditId', async ({request, params}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(200)

        const auditId = params.auditId as string
        const audit = activeAudits.get(auditId)

        // 使用與 getAuditIssues() 一致的統計
        const issues = getAuditIssues()
        const errCount = issues.filter((i) => i.severity === 'error').length
        const warnCount = issues.filter((i) => i.severity === 'warning').length
        const noticeCount = issues.filter((i) => i.severity === 'notice').length

        const catStats = ['SEO', 'Performance', 'Links', 'Content', 'Indexability'].map((name) => {
            const catKey = name.toLowerCase() as any
            const catIssues = issues.filter((i) => i.category === catKey)
            return {
                name,
                errors: catIssues.filter((i) => i.severity === 'error').length,
                warnings: catIssues.filter((i) => i.severity === 'warning').length,
                notices: catIssues.filter((i) => i.severity === 'notice').length,
            }
        })

        return HttpResponse.json({
            auditId,
            domain: audit?.domain ?? 'example.com',
            completedAt: new Date().toISOString(),
            healthScore: 72,
            summary: {errors: errCount, warnings: warnCount, notices: noticeCount},
            categories: catStats,
        })
    }),

    // ─── GET /api/audit/issues/:auditId ─────────────────────
    // 考點：faceted filter — facets 計數隨篩選條件變化
    http.get('/api/audit/issues/:auditId', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(250)

        const url = new URL(request.url)
        const category = getParam(url, 'category') ?? 'all'
        const severity = getParam(url, 'severity') ?? 'all'
        const cursor = getParam(url, 'cursor')
        const limit = getIntParam(url, 'limit', 50)

        let items = getAuditIssues()
        if (category !== 'all') items = items.filter((i) => i.category === category)
        if (severity !== 'all') items = items.filter((i) => i.severity === severity)

        // facets 基於篩選後的資料
        const facets = {
            category: {} as Record<string, number>,
            severity: {} as Record<string, number>,
        }
        for (const item of items) {
            facets.category[item.category] = (facets.category[item.category] ?? 0) + 1
            facets.severity[item.severity] = (facets.severity[item.severity] ?? 0) + 1
        }

        const {page, nextCursor, hasMore, total} = paginateWithCursor(
            items, cursor, limit, (i) => i.id,
        )

        return HttpResponse.json({
            data: page,
            facets,
            pagination: {cursor: nextCursor, hasMore, total},
        })
    }),

    // ─── GET /api/audit/url-tree/:auditId ───────────────────
    // 考點：lazy expand — 點擊展開時才呼叫 API
    http.get('/api/audit/url-tree/:auditId', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(150)

        const url = new URL(request.url)
        const path = url.searchParams.get('path') ?? '/'

        const tree = getUrlTree()
        const children = tree.get(path) ?? []

        return HttpResponse.json({path, children})
    }),

    // ─── GET /api/audit/export/:auditId ─────────────────────
    // 考點：streaming 匯出 — chunked transfer
    http.get('/api/audit/export/:auditId', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const format = new URL(request.url).searchParams.get('format') ?? 'csv'
        const issues = getAuditIssues()
        const encoder = new TextEncoder()

        if (format === 'csv') {
            const stream = new ReadableStream({
                async start(controller) {
                    // Header
                    controller.enqueue(encoder.encode('id,rule,severity,category,message,affectedUrls\n'))
                    await new Promise((r) => setTimeout(r, 100))

                    // Chunked rows (50 per chunk)
                    for (let i = 0; i < issues.length; i += 50) {
                        const chunk = issues.slice(i, i + 50)
                        const csv = chunk
                            .map((iss) =>
                                `${iss.id},${iss.rule},${iss.severity},${iss.category},"${iss.message}",${iss.affectedUrls}`,
                            )
                            .join('\n') + '\n'
                        controller.enqueue(encoder.encode(csv))
                        await new Promise((r) => setTimeout(r, 200)) // 模擬產生延遲
                    }
                    controller.close()
                },
            })

            return new HttpResponse(stream, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Transfer-Encoding': 'chunked',
                    'Content-Disposition': 'attachment; filename="audit-report.csv"',
                },
            })
        }

        // fallback JSON
        return HttpResponse.json({issues})
    }),
]