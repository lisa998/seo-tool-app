// mocks/utils/rateLimit.ts
import {HttpResponse} from 'msw'

const requestCounts = new Map<string, { count: number; resetAt: number }>()

/**
 * 模擬 Rate Limiting
 * @param endpoint - API 路徑作為限流 key
 * @param limit - 每分鐘最大請求數（預設 30）
 * @param windowMs - 限流視窗毫秒數（預設 60000）
 * @returns 超過限制回 429，否則 null
 */
export function checkRateLimit(
    endpoint: string,
    limit: number = 30,
    windowMs: number = 60000,
): ReturnType<typeof HttpResponse.json> | null {
    const now = Date.now()
    const entry = requestCounts.get(endpoint)

    if (!entry || now > entry.resetAt) {
        requestCounts.set(endpoint, {count: 1, resetAt: now + windowMs})
        return null
    }

    entry.count++

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return HttpResponse.json(
            {
                error: 'RATE_LIMITED',
                message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
                retryAfter,
            },
            {
                status: 429,
                headers: {'Retry-After': String(retryAfter)},
            },
        )
    }

    return null
}

/**
 * 重置特定 endpoint 的計數器（測試用）
 */
export function resetRateLimit(endpoint: string): void {
    requestCounts.delete(endpoint)
}

/**
 * 重置所有計數器
 */
export function resetAllRateLimits(): void {
    requestCounts.clear()
}