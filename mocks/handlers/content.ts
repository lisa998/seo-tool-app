// mocks/handlers/content.ts
import { delay, http, HttpResponse } from 'msw';
import { requireAuth } from '../utils/auth';
import { checkRateLimit } from '../utils/rateLimit';
import { maybeError } from '../utils/errorInjection';
import { getIntParam, getParam, paginateWithCursor, sortItems } from '../utils/pagination';
import { getContentItems } from '../factories/dataStore';
import { faker } from '@faker-js/faker';

export const contentHandlers = [
  // ─── GET /api/content/search ─────────────────────────────
  // 考點：infinite scroll (IntersectionObserver) + cursor pagination
  // 考點延伸：多欄位排序 + 搜尋字串高亮（前端負責 highlight）
  http.get('*/api/content/search', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    const rateErr = checkRateLimit('content-search', 20);
    if (rateErr) return rateErr;
    const err = maybeError();
    if (err) return err;

    await delay('real');

    const url = new URL(request.url);
    const q = getParam(url, 'q') ?? '';
    const cursor = getParam(url, 'cursor');
    const limit = getIntParam(url, 'limit', 20);
    const sort = getParam(url, 'sort') ?? 'socialShares_desc';
    const drMin = getIntParam(url, 'drMin', 0);
    const dateFrom = getParam(url, 'dateFrom');
    const dateTo = getParam(url, 'dateTo');

    let items = getContentItems();

    // 搜尋篩選
    if (q) {
      const lq = q.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(lq) ||
          c.domain.toLowerCase().includes(lq) ||
          c.excerpt.toLowerCase().includes(lq),
      );
    }

    // DR 篩選
    if (drMin > 0) {
      items = items.filter((c) => c.domainRating >= drMin);
    }

    // 日期篩選
    if (dateFrom) {
      items = items.filter((c) => c.publishedAt >= dateFrom);
    }
    if (dateTo) {
      items = items.filter((c) => c.publishedAt <= dateTo);
    }

    // 排序 — 支援巢狀欄位 metrics.socialShares 等
    if (sort.startsWith('socialShares')) {
      const desc = sort.endsWith('desc');
      items = [...items].sort((a, b) =>
        desc ? b.metrics.socialShares - a.metrics.socialShares : a.metrics.socialShares - b.metrics.socialShares,
      );
    } else if (sort.startsWith('backlinks')) {
      const desc = sort.endsWith('desc');
      items = [...items].sort((a, b) =>
        desc ? b.metrics.backlinks - a.metrics.backlinks : a.metrics.backlinks - b.metrics.backlinks,
      );
    } else if (sort.startsWith('traffic')) {
      const desc = sort.endsWith('desc');
      items = [...items].sort((a, b) =>
        desc
          ? b.metrics.organicTraffic - a.metrics.organicTraffic
          : a.metrics.organicTraffic - b.metrics.organicTraffic,
      );
    } else if (sort.startsWith('date')) {
      const desc = sort.endsWith('desc');
      items = [...items].sort((a, b) =>
        desc ? b.publishedAt.localeCompare(a.publishedAt) : a.publishedAt.localeCompare(b.publishedAt),
      );
    } else if (sort.startsWith('dr')) {
      items = sortItems(items, sort, { dr: 'domainRating' });
    }

    const { page, nextCursor, hasMore, total } = paginateWithCursor(items, cursor, limit, (c) => c.id);

    return HttpResponse.json({
      data: page,
      query: q,
      pagination: { cursor: nextCursor, hasMore, total },
    });
  }),

  // ─── GET /api/content/trending ───────────────────────────
  // 考點：即時排行榜，與 search 共用資料來源
  http.get('*/api/content/trending', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    // 從同一份 contentItems 計算 trending（確保一致性）
    const items = getContentItems();
    const sorted = [...items].sort((a, b) => b.metrics.socialShares - a.metrics.socialShares).slice(0, 20);

    const trending = sorted.map((item) => ({
      id: item.id,
      title: item.title,
      domain: item.domain,
      socialShares: item.metrics.socialShares,
      shareGrowth: faker.number.float({ min: 10, max: 500, fractionDigits: 1 }),
    }));

    return HttpResponse.json({ trending });
  }),
];
