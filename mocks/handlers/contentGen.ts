// mocks/handlers/contentGen.ts
import {delay, http, HttpResponse} from 'msw'
import {requireAuth} from '../utils/auth'
import {maybeError} from '../utils/errorInjection'
import {MOCK_USERS} from '../factories/dataStore'
import {faker} from '@faker-js/faker'
import type {AiSuggestion, EditorVersion, SeoScoreCheck} from '../types'

// ─── 共享編輯器狀態（跨 save / history / ai-review 一致性）────
const editorHistory: EditorVersion[] = [
    {
        version: 1,
        savedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        savedBy: MOCK_USERS[0],
        wordCount: 320,
        changesSummary: '初稿：建立大綱與前 3 段',
    },
    {
        version: 2,
        savedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        savedBy: MOCK_USERS[1],
        wordCount: 890,
        changesSummary: '擴充內文至 890 字；新增圖片區塊',
    },
    {
        version: 3,
        savedAt: new Date(Date.now() - 3600000).toISOString(),
        savedBy: MOCK_USERS[0],
        wordCount: 1250,
        changesSummary: '完成結論段落；加入 CTA',
    },
]

let currentDocContent = `# SEO 優化完整指南 2024

## 什麼是 SEO？

SEO（搜尋引擎優化）是提升網站在搜尋引擎自然搜尋結果中排名的過程。
透過優化網站的技術結構、內容品質、和外部連結，你可以讓更多目標受眾找到你的網站。

## 關鍵字研究

關鍵字研究是 SEO 的基礎。你需要找到目標受眾實際搜尋的詞彙，
並根據搜尋量、競爭度和商業意圖來選擇最佳關鍵字。

## 內容優化

高品質的內容是 SEO 成功的核心。確保你的內容：
- 回答使用者的搜尋意圖
- 包含目標關鍵字的自然變體
- 結構清晰，使用適當的標題層級
- 提供獨特的價值和見解`

export const contentGenHandlers = [
    // ─── POST /api/content-gen/keyword-analysis ─────────────
    // 考點：表單送出後 loading → 結果渲染
    http.post('/api/content-gen/keyword-analysis', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        const err = maybeError()
        if (err) return err

        await delay(500)

        const body = (await request.json()) as { keyword?: string; db?: string }
        const keyword = body.keyword ?? 'seo tools'
        const db = body.db ?? 'us'

        return HttpResponse.json({
            keyword,
            db,
            volume: faker.number.int({min: 5000, max: 100000}),
            difficulty: faker.number.int({min: 20, max: 85}),
            suggestedWordCount: {min: 1500, max: 2500},
            relatedKeywords: Array.from({length: 8}, () => ({
                keyword: faker.lorem.words({min: 2, max: 4}),
                volume: faker.number.int({min: 500, max: 30000}),
            })),
            serpCompetitors: Array.from({length: 5}, () => ({
                title: faker.lorem.sentence({min: 5, max: 10}),
                url: `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
                wordCount: faker.number.int({min: 800, max: 3500}),
                dr: faker.number.int({min: 30, max: 95}),
            })),
        })
    }),

    // ─── POST /api/content-gen/titles (SSE) ─────────────────
    // 考點：SSE 逐條推送標題建議（模擬 AI 串流生成）
    http.post('/api/content-gen/titles', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const body = (await request.json()) as { keyword?: string }
        const keyword = body.keyword ?? 'seo tools'
        const encoder = new TextEncoder()

        const titles = [
            `${keyword} 完整指南：從入門到精通的實戰教學`,
            `2024 年最佳 ${keyword}：專家推薦的 10 個工具`,
            `如何善用 ${keyword} 提升網站流量 300%`,
            `${keyword} 全面比較：哪個最適合你的需求？`,
            `新手必讀：${keyword} 的 5 個核心策略`,
        ]

        const stream = new ReadableStream({
            async start(controller) {
                for (let i = 0; i < titles.length; i++) {
                    const event =
                        `event: title\n` +
                        `data: ${JSON.stringify({
                            index: i,
                            title: titles[i],
                            score: faker.number.float({min: 60, max: 98, fractionDigits: 1}),
                        })}\n\n`
                    controller.enqueue(encoder.encode(event))
                    await new Promise((r) => setTimeout(r, 800))
                }

                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`))
                controller.close()
            },
        })

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        })
    }),

    // ─── POST /api/content-gen/outline (SSE) ────────────────
    // 考點：SSE 逐步推送大綱節點 + 前端即時渲染樹狀結構
    http.post('/api/content-gen/outline', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const encoder = new TextEncoder()

        const sections = [
            {id: 'sec_1', level: 'h2', title: '什麼是 SEO？', estimatedWords: 200},
            {id: 'sec_1_1', level: 'h3', parentId: 'sec_1', title: 'SEO 的核心概念', estimatedWords: 150},
            {id: 'sec_1_2', level: 'h3', parentId: 'sec_1', title: 'SEO vs SEM 的差異', estimatedWords: 120},
            {id: 'sec_2', level: 'h2', title: '關鍵字研究策略', estimatedWords: 300},
            {id: 'sec_2_1', level: 'h3', parentId: 'sec_2', title: '長尾關鍵字的威力', estimatedWords: 180},
            {id: 'sec_2_2', level: 'h3', parentId: 'sec_2', title: '競爭對手關鍵字分析', estimatedWords: 200},
            {id: 'sec_3', level: 'h2', title: '頁面 SEO 優化', estimatedWords: 350},
            {id: 'sec_3_1', level: 'h3', parentId: 'sec_3', title: 'Title 與 Meta Description', estimatedWords: 150},
            {id: 'sec_3_2', level: 'h3', parentId: 'sec_3', title: '內容結構與標題層級', estimatedWords: 150},
            {id: 'sec_4', level: 'h2', title: '技術 SEO', estimatedWords: 280},
            {id: 'sec_5', level: 'h2', title: '連結建設', estimatedWords: 250},
            {id: 'sec_6', level: 'h2', title: '總結與行動計畫', estimatedWords: 150},
        ]

        const stream = new ReadableStream({
            async start(controller) {
                for (const section of sections) {
                    const event =
                        `event: section\n` +
                        `data: ${JSON.stringify(section)}\n\n`
                    controller.enqueue(encoder.encode(event))
                    await new Promise((r) => setTimeout(r, 400))
                }
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`))
                controller.close()
            },
        })

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        })
    }),

    // ─── POST /api/content-gen/paragraph (SSE token streaming) ──
    // 考點：逐 token 推送（類似 ChatGPT 效果）+ 前端即時拼接渲染
    // 這是最重要的 SSE 考點 — 模擬 LLM token-by-token streaming
    http.post('/api/content-gen/paragraph', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const body = (await request.json()) as { sectionId?: string; title?: string }
        const encoder = new TextEncoder()

        const paragraph = `搜尋引擎優化（SEO）是數位行銷中最重要的策略之一。` +
            `透過系統化的方法，我們可以提升網站在 Google、Bing 等搜尋引擎中的自然排名。` +
            `根據最新統計，超過 68% 的線上體驗始於搜尋引擎，` +
            `而排名前三的搜尋結果佔據了總點擊量的 75% 以上。` +
            `這意味著，如果你的網站無法出現在搜尋結果的第一頁，` +
            `你就可能錯失大量潛在客戶。`

        // 模擬 token-by-token 推送
        const tokens = paragraph.split('')
        let buffer = ''

        const stream = new ReadableStream({
            async start(controller) {
                for (let i = 0; i < tokens.length; i++) {
                    buffer += tokens[i]

                    // 每 3-5 個字元推送一次（模擬 token 大小）
                    if (buffer.length >= 3 || i === tokens.length - 1) {
                        const event =
                            `event: token\n` +
                            `data: ${JSON.stringify({token: buffer, index: i})}\n\n`
                        controller.enqueue(encoder.encode(event))
                        buffer = ''
                        await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
                    }
                }

                // 完成事件
                controller.enqueue(encoder.encode(
                    `event: done\ndata: ${JSON.stringify({fullText: paragraph})}\n\n`,
                ))
                controller.close()
            },
        })

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        })
    }),

    // ─── POST /api/content-gen/meta-description ─────────────
    http.post('/api/content-gen/meta-description', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(400)

        const body = (await request.json()) as { content?: string; keyword?: string }
        const keyword = body.keyword ?? 'SEO'

        return HttpResponse.json({
            description: `探索 ${keyword} 的完整指南。學習最新的優化策略、工具比較和實戰技巧，幫助你的網站在搜尋結果中脫穎而出。立即閱讀！`,
            length: 72,
            hasKeyword: true,
        })
    }),

    // ─── POST /api/content-gen/seo-score ────────────────────
    // 考點：多維度評分 + 即時反饋
    http.post('/api/content-gen/seo-score', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(300)

        const body = (await request.json()) as { content?: string; keyword?: string }
        const keyword = body.keyword ?? 'SEO'
        const contentLen = (body.content ?? '').length

        const checks: SeoScoreCheck[] = [
            {
                category: '關鍵字',
                name: '標題包含關鍵字',
                status: 'pass',
                score: 100,
                message: `標題中包含「${keyword}」`,
                icon: '✅'
            },
            {
                category: '關鍵字',
                name: '關鍵字密度',
                status: contentLen > 500 ? 'pass' : 'warning',
                score: contentLen > 500 ? 85 : 40,
                message: contentLen > 500 ? '關鍵字密度在建議範圍內' : '內容過短，無法準確計算密度',
                icon: contentLen > 500 ? '✅' : '⚠️'
            },
            {
                category: '結構',
                name: '標題層級',
                status: 'pass',
                score: 90,
                message: '使用了正確的 H2-H3 層級結構',
                icon: '✅'
            },
            {
                category: '結構',
                name: '段落長度',
                status: 'pass',
                score: 80,
                message: '段落長度適中，易於閱讀',
                icon: '✅'
            },
            {
                category: '內容',
                name: '字數',
                status: contentLen > 1000 ? 'pass' : 'warning',
                score: contentLen > 1000 ? 90 : 50,
                message: contentLen > 1000 ? `字數 ${contentLen} 符合建議範圍` : '建議增加至 1500 字以上',
                icon: contentLen > 1000 ? '✅' : '⚠️'
            },
            {
                category: '內容',
                name: '圖片 alt 文字',
                status: 'warning',
                score: 60,
                message: '建議為圖片加上包含關鍵字的 alt 文字',
                icon: '⚠️'
            },
            {
                category: '連結',
                name: '內部連結',
                status: 'error',
                score: 20,
                message: '未偵測到內部連結，建議加入 2-5 個',
                icon: '❌'
            },
            {
                category: '連結',
                name: '外部連結',
                status: 'pass',
                score: 75,
                message: '已包含適量的外部權威連結',
                icon: '✅'
            },
        ]

        const overallScore = Math.round(
            checks.reduce((sum, c) => sum + c.score, 0) / checks.length,
        )

        return HttpResponse.json({
            overallScore,
            recommendation: overallScore >= 80
                ? '內容 SEO 品質優良，可以發布！'
                : overallScore >= 60
                    ? '建議修正標記為警告的項目後再發布'
                    : '請先修正錯誤項目以提升搜尋排名',
            checks,
            keywordDensity: {
                primary: {
                    keyword,
                    count: faker.number.int({min: 8, max: 20}),
                    density: faker.number.float({min: 1.2, max: 2.8, fractionDigits: 1}),
                    recommended: '1.5% - 2.5%'
                },
                secondary: [
                    {keyword: '搜尋引擎', count: faker.number.int({min: 3, max: 8}), found: true},
                    {keyword: '排名', count: faker.number.int({min: 2, max: 6}), found: true},
                    {keyword: '流量', count: faker.number.int({min: 1, max: 4}), found: true},
                ],
            },
        })
    }),

    // ─── POST /api/content-gen/editor/save ───────────────────
    // 考點：debounced auto-save + 版本遞增（與 history 一致）
    http.post('/api/content-gen/editor/save', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(200)

        const err = maybeError(0.03)
        if (err) return err

        const body = (await request.json()) as { content?: string; userId?: string }
        const content = body.content ?? ''
        currentDocContent = content

        const newVersion: EditorVersion = {
            version: editorHistory.length + 1,
            savedAt: new Date().toISOString(),
            savedBy: MOCK_USERS.find((u) => u.id === body.userId) ?? MOCK_USERS[0],
            wordCount: content.split(/\s+/).length,
            changesSummary: '自動儲存',
        }
        editorHistory.push(newVersion)

        return HttpResponse.json({
            success: true,
            version: newVersion.version,
            savedAt: newVersion.savedAt,
        })
    }),

    // ─── GET /api/content-gen/editor/history ─────────────────
    http.get('/api/content-gen/editor/history', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr
        await delay(150)

        return HttpResponse.json({versions: editorHistory})
    }),

    // ─── POST /api/content-gen/editor/ai-review (SSE) ───────
    // 考點：SSE 推送 AI 建議（grammar / style / seo）+ 前端即時高亮
    http.post('/api/content-gen/editor/ai-review', async ({request}) => {
        const authErr = requireAuth(request)
        if (authErr) return authErr

        const encoder = new TextEncoder()

        const suggestions: AiSuggestion[] = [
            {
                id: 'sug_001', range: {from: 45, to: 65},
                original: '最重要的策略之一',
                suggested: '最具影響力的策略之一',
                reason: '更具體的用詞能提升內容說服力',
                type: 'style',
            },
            {
                id: 'sug_002', range: {from: 120, to: 155},
                original: '透過系統化的方法',
                suggested: '透過經過驗證的系統化方法',
                reason: '加入權威感的修飾詞',
                type: 'style',
            },
            {
                id: 'sug_003', range: {from: 200, to: 230},
                original: '超過 68% 的線上體驗',
                suggested: '根據 BrightEdge 研究，超過 68% 的線上體驗',
                reason: '加入數據來源可提升 E-E-A-T 信號',
                type: 'seo',
            },
            {
                id: 'sug_004', range: {from: 300, to: 320},
                original: '大量潛在客戶',
                suggested: '大量高意圖的潛在客戶',
                reason: '更精準的用詞',
                type: 'style',
            },
            {
                id: 'sug_005', range: {from: 0, to: 0},
                original: '',
                suggested: '建議在文章開頭加入目標關鍵字',
                reason: '首段包含關鍵字有助於搜尋引擎理解主題',
                type: 'seo',
            },
        ]

        const stream = new ReadableStream({
            async start(controller) {
                for (const suggestion of suggestions) {
                    const event =
                        `event: suggestion\n` +
                        `data: ${JSON.stringify(suggestion)}\n\n`
                    controller.enqueue(encoder.encode(event))
                    await new Promise((r) => setTimeout(r, 600))
                }

                // summary 事件
                const summary = {
                    total: suggestions.length,
                    byType: {
                        grammar: suggestions.filter((s) => s.type === 'grammar').length,
                        style: suggestions.filter((s) => s.type === 'style').length,
                        seo: suggestions.filter((s) => s.type === 'seo').length,
                    },
                }
                controller.enqueue(encoder.encode(
                    `event: summary\ndata: ${JSON.stringify(summary)}\n\n`,
                ))
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`))
                controller.close()
            },
        })

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        })
    }),
]