// mocks/handlers/auth.ts
import {delay, http, HttpResponse} from 'msw'
import {CURRENT_USER, I18N_MESSAGES, rotateTokens,} from '../factories/dataStore'
import {requireAuth} from '../utils/auth'
import {maybeError} from '../utils/errorInjection'

export const authHandlers = [
    // ─── POST /api/auth/login ───────────────────────────────
    http.post('*/api/auth/login', async ({request}) => {
        await delay(300)

        const body = (await request.json()) as { email?: string; password?: string }

        if (!body.email || !body.password) {
            return HttpResponse.json(
                {error: 'VALIDATION_ERROR', message: '缺少 email 或 password'},
                {status: 400},
            )
        }

        // 模擬錯誤帳號
        if (body.email === 'wrong@example.com') {
            return HttpResponse.json(
                {error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤'},
                {status: 401},
            )
        }

        const {accessToken, refreshToken} = rotateTokens()

        return HttpResponse.json({
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user: CURRENT_USER,
        })
    }),

    // ─── POST /api/auth/refresh ─────────────────────────────
    // 考點：axios interceptor 攔截 401 → 自動 refresh → 失敗才跳登入頁
    // 考點延伸：同時 3 個 401 如何避免觸發 3 次 refresh？ → queue + 單一 promise
    http.post('*/api/auth/refresh', async ({request}) => {
        await delay(200)

        const body = (await request.json()) as { refreshToken?: string }

        if (!body.refreshToken) {
            return HttpResponse.json(
                {error: 'VALIDATION_ERROR', message: 'Missing refreshToken'},
                {status: 400},
            )
        }

        // 模擬 refresh token 過期
        if (body.refreshToken === 'invalid' || body.refreshToken === 'expired_refresh') {
            return HttpResponse.json(
                {error: 'REFRESH_EXPIRED', message: 'Please re-login'},
                {status: 401},
            )
        }

        const {accessToken} = rotateTokens()

        return HttpResponse.json({
            accessToken,
            expiresIn: 3600,
        })
    }),

    // ─── GET /api/auth/me ───────────────────────────────────
    // 考點：SSR 端 nuxtServerInit 從 req.headers.cookie parse token → 呼叫此 API
    http.get('*/api/auth/me', async ({request}) => {
        await delay(100)

        const authErr = requireAuth(request)
        if (authErr) return authErr

        return HttpResponse.json(CURRENT_USER)
    }),

    // ─── GET /api/i18n/messages ─────────────────────────────
    // 考點：Q19 i18n locale 偵測。SSR 階段根據 Accept-Language / cookie 決定 locale
    http.get('*/api/i18n/messages', async ({request}) => {
        await delay(50)

        const err = maybeError(0.02) // i18n 較少出錯
        if (err) return err

        const url = new URL(request.url)
        const locale = url.searchParams.get('locale') ?? 'zh-TW'
        const messages = I18N_MESSAGES[locale] ?? I18N_MESSAGES['en']

        return HttpResponse.json({
            locale,
            messages,
        })
    }),
]