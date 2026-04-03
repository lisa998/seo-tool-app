// mocks/handlers/rankTracker.ts
import { delay, http, HttpResponse } from 'msw';
import { requireAuth } from '../utils/auth';
import { maybeError } from '../utils/errorInjection';
import { getIntParam, getParam, paginateWithCursor, sortItems } from '../utils/pagination';
import { getNotificationRules, getTags, getTrackedKeywords } from '../factories/dataStore';
import { faker } from '@faker-js/faker';

export const rankTrackerHandlers = [
  // ─── GET /api/rank-tracker/keywords ──────────────────────
  // 考點：position 多時間點 + sparkline + summary tab 計數
  http.get('*/api/rank-tracker/keywords', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    const err = maybeError();
    if (err) return err;

    await delay('real');

    const url = new URL(request.url);
    const cursor = getParam(url, 'cursor');
    const limit = getIntParam(url, 'limit', 50);
    const tab = getParam(url, 'tab') ?? 'all';
    const tag = getParam(url, 'tag');
    const sort = getParam(url, 'sort') ?? 'position_asc';

    let items = getTrackedKeywords();

    // Tab 篩選
    if (tab === 'improved') {
      items = items.filter((k) => k.position.current < k.position.weekAgo);
    } else if (tab === 'declined') {
      items = items.filter((k) => k.position.current > k.position.weekAgo);
    } else if (tab === 'new') {
      items = items.filter((k) => k.position.weekAgo > 90);
    }

    // Tag 篩選
    if (tag) {
      const tags = tag.split(',');
      items = items.filter((k) => tags.some((t) => k.tags.includes(t)));
    }

    // 排序
    const fieldMap: Record<string, string> = {
      position: 'position',
      volume: 'volume',
    };
    // 特殊處理 position 排序（需用 current）
    if (sort.startsWith('position')) {
      const order = sort.endsWith('desc') ? -1 : 1;
      items = [...items].sort((a, b) => (a.position.current - b.position.current) * order);
    } else if (sort.startsWith('change')) {
      const order = sort.endsWith('desc') ? -1 : 1;
      items = [...items].sort((a, b) => {
        const da = a.position.weekAgo - a.position.current;
        const db = b.position.weekAgo - b.position.current;
        return (db - da) * order;
      });
    } else {
      items = sortItems(items, sort, { volume: 'volume' });
    }

    // Summary（基於全部資料，不受篩選影響 → 一致性）
    const allKws = getTrackedKeywords();
    const summary = {
      total: allKws.length,
      improved: allKws.filter((k) => k.position.current < k.position.weekAgo).length,
      declined: allKws.filter((k) => k.position.current > k.position.weekAgo).length,
      new: allKws.filter((k) => k.position.weekAgo > 90).length,
    };

    const { page, nextCursor, hasMore, total } = paginateWithCursor(items, cursor, limit, (k) => k.id);

    return HttpResponse.json({
      data: page,
      summary,
      pagination: { cursor: nextCursor, hasMore, total },
    });
  }),

  // ─── GET /api/rank-tracker/distribution ──────────────────
  http.get('*/api/rank-tracker/distribution', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    const kws = getTrackedKeywords();
    const now = new Date();

    return HttpResponse.json({
      dataPoints: Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        // 基於真實 tracked keywords 的分佈，加入隨機浮動
        const jitter = () => Math.floor(Math.random() * 5) - 2;
        return {
          date: d.toISOString().slice(0, 10),
          top3: kws.filter((k) => k.position.current <= 3).length + jitter(),
          top10: kws.filter((k) => k.position.current <= 10).length + jitter(),
          top50: kws.filter((k) => k.position.current <= 50).length + jitter(),
          beyond50: kws.filter((k) => k.position.current > 50).length + jitter(),
        };
      }),
    });
  }),

  // ─── POST /api/rank-tracker/keywords/batch ──────────────
  // 考點：Optimistic UI + rollback + 原子性批次操作
  http.post('*/api/rank-tracker/keywords/batch', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;

    await delay(400); // 刻意慢一些，讓前端有時間展示 optimistic UI

    // 🎯 5% 機率失敗 → 測試 rollback
    const err = maybeError(0.05);
    if (err) return err;

    const body = (await request.json()) as {
      action: string;
      keywordIds: string[];
      payload?: Record<string, unknown>;
    };

    const kws = getTrackedKeywords();
    const results = body.keywordIds.map((id) => {
      const kw = kws.find((k) => k.id === id);
      if (!kw) return { id, success: false, error: 'NOT_FOUND' };

      switch (body.action) {
        case 'addTag':
          if (body.payload?.tag && !kw.tags.includes(body.payload.tag as string)) {
            kw.tags.push(body.payload.tag as string);
          }
          break;
        case 'removeTag':
          if (body.payload?.tag) {
            kw.tags = kw.tags.filter((t) => t !== body.payload!.tag);
          }
          break;
        case 'delete':
          // 標記刪除（實際不移除，簡化 mock）
          break;
        case 'refreshRank':
          kw.position.current = faker.number.int({ min: 1, max: 100 });
          break;
      }
      return { id, success: true };
    });

    return HttpResponse.json({
      affected: results.filter((r) => r.success).length,
      results,
    });
  }),

  // ─── GET /api/rank-tracker/tags ──────────────────────────
  http.get('*/api/rank-tracker/tags', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(100);

    return HttpResponse.json({ tags: getTags() });
  }),

  // ─── GET /api/rank-tracker/notification-rules ────────────
  http.get('*/api/rank-tracker/notification-rules', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(100);

    return HttpResponse.json({ rules: getNotificationRules() });
  }),

  // ─── POST /api/rank-tracker/notification-rules ───────────
  http.post('*/api/rank-tracker/notification-rules', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    const body = (await request.json()) as Record<string, unknown>;
    const rules = getNotificationRules();
    const newRule = {
      id: `rule_${String(rules.length + 1).padStart(3, '0')}`,
      name: (body.name as string) ?? 'New Rule',
      condition: (body.condition as any) ?? { metric: 'position_drop', threshold: 5 },
      channels: (body.channels as string[]) ?? ['email'],
      enabled: true,
    };
    rules.push(newRule);

    return HttpResponse.json(newRule, { status: 201 });
  }),
];
