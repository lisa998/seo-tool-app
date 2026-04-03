// mocks/utils/errorInjection.ts
import { HttpResponse } from 'msw';

/**
 * 隨機 Server Error 注入
 * @param rate - 錯誤機率（0-1），預設 0.05 = 5%
 * @returns 觸發時回 500，否則 null
 */
export function maybeError(rate: number = 0.05): ReturnType<typeof HttpResponse.json> | null {
  if (Math.random() < rate) {
    return HttpResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again later.',
        requestId: `req_${Date.now().toString(36)}`,
      },
      { status: 500 },
    );
  }
  return null;
}

/**
 * 條件式錯誤注入：特定請求次數後回 500
 * 用於測試 retry 邏輯
 */
const callCounts = new Map<string, number>();

export function errorOnNthCall(key: string, n: number): ReturnType<typeof HttpResponse.json> | null {
  const count = (callCounts.get(key) ?? 0) + 1;
  callCounts.set(key, count);
  if (count === n) {
    return HttpResponse.json({ error: 'INTERNAL_ERROR', message: `Simulated failure on call #${n}` }, { status: 500 });
  }
  return null;
}
