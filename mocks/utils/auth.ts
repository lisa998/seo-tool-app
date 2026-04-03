// mocks/utils/auth.ts
import { HttpResponse } from 'msw';
import { EXPIRED_TOKEN } from '../factories/dataStore';

/**
 * 驗證 Authorization header
 * - 無 header → 401 UNAUTHORIZED
 * - token === 'expired' → 401 TOKEN_EXPIRED（觸發前端 refresh 流程）
 * - token 不合法 → 401 INVALID_TOKEN
 * - 通過 → 回傳 null
 */
export function requireAuth(request: Request): ReturnType<typeof HttpResponse.json> | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return HttpResponse.json({ error: 'UNAUTHORIZED', message: 'Missing or invalid token' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  if (token === EXPIRED_TOKEN) {
    return HttpResponse.json({ error: 'TOKEN_EXPIRED', message: 'Token has expired' }, { status: 401 });
  }

  // 在嚴格模式下可檢查 token 是否等於 currentAccessToken
  // 這裡放寬：只要不是 expired 且格式正確就通過
  if (token.length < 10) {
    return HttpResponse.json({ error: 'INVALID_TOKEN', message: 'Malformed token' }, { status: 401 });
  }

  return null; // 通過驗證
}
