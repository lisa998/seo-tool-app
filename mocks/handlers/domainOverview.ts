// mocks/handlers/domainOverview.ts
import { delay, http, HttpResponse } from 'msw';
import { requireAuth } from '../utils/auth';
import { maybeError } from '../utils/errorInjection';
import { DOMAIN_PROFILES, PRIMARY_DOMAIN } from '../factories/dataStore';
import { faker } from '@faker-js/faker';

// ─── 快取模擬 ────────────────────────────────────────────
// 模擬 server-side cache：同一 domain+range 在 2 秒內重複請求立即回應
const CACHE = new Map<string, { data: unknown; expireAt: number }>();

function getCached(key: string): unknown | null {
  const entry = CACHE.get(key);
  if (entry && Date.now() < entry.expireAt) return entry.data;
  return null;
}

function setCache(key: string, data: unknown, ttlMs = 2000): void {
  CACHE.set(key, { data, expireAt: Date.now() + ttlMs });
}

// ─── 資料產生器（與 DOMAIN_PROFILES 一致）─────────────────
function rangeToPoints(range: string): number {
  const map: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '3m': 13,
    '6m': 26,
    '1y': 52,
    all: 104,
  };
  return map[range] ?? 26;
}

function granularityForRange(range: string): string {
  if (['7d', '30d'].includes(range)) return 'daily';
  if (['3m', '6m'].includes(range)) return 'weekly';
  return 'monthly';
}

function generateTrafficTrend(domain: string, range: string) {
  const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN];
  const points = rangeToPoints(range);
  const granularity = granularityForRange(range);
  const baseOrganic = profile.organicTraffic;
  const basePaid = Math.round(baseOrganic * 0.03);
  const now = Date.now();

  return {
    domain,
    range,
    granularity,
    dataPoints: Array.from({ length: points }, (_, i) => {
      const date = new Date(
        now - (points - i) * (granularity === 'daily' ? 86400000 : granularity === 'weekly' ? 604800000 : 2592000000),
      );
      return {
        date: date.toISOString().slice(0, 10),
        organic: Math.round(baseOrganic * (0.9 + i * (0.1 / points) + (Math.random() - 0.5) * 0.02)),
        paid: Math.round(basePaid * (0.8 + Math.random() * 0.4)),
      };
    }),
  };
}

export const domainOverviewHandlers = [
  // ─── GET /api/domain-overview/summary ────────────────────
  // 考點：asyncData 首屏 KPI；下方圖表用 fetch + fetchOnServer: false
  http.get('*/api/domain-overview/summary', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    const err = maybeError();
    if (err) return err;

    await delay(120);

    const url = new URL(request.url);
    const domain = url.searchParams.get('domain') ?? PRIMARY_DOMAIN;
    const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN];

    return HttpResponse.json({
      domain,
      ahrefsRank: faker.number.int({ min: 50, max: 200 }),
      ahrefsRankDelta: faker.number.int({ min: -30, max: 30 }),
      domainRating: profile.domainRating,
      domainRatingDelta: faker.number.int({ min: -3, max: 3 }),
      backlinks: profile.backlinks,
      backlinksDelta: faker.number.int({ min: -50000, max: 200000 }),
      referringDomains: profile.referringDomains,
      organicTraffic: profile.organicTraffic,
      organicKeywords: profile.keywords,
    });
  }),

  // ─── GET /api/domain-overview/traffic-trend ──────────────
  // 考點：時間區間 ↔ 全部圖表聯動 + server-side cache
  http.get('*/api/domain-overview/traffic-trend', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;

    const url = new URL(request.url);
    const domain = url.searchParams.get('domain') ?? PRIMARY_DOMAIN;
    const range = url.searchParams.get('range') ?? '6m';
    const cacheKey = `traffic:${domain}:${range}`;

    const cached = getCached(cacheKey);
    if (cached) return HttpResponse.json(cached);

    await delay(300); // 圖表 API 稍慢

    const data = generateTrafficTrend(domain, range);
    setCache(cacheKey, data);
    return HttpResponse.json(data);
  }),

  // ─── GET /api/domain-overview/referring-domains-growth ───
  http.get('*/api/domain-overview/referring-domains-growth', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;

    await delay(250);

    const url = new URL(request.url);
    const domain = url.searchParams.get('domain') ?? PRIMARY_DOMAIN;
    const range = url.searchParams.get('range') ?? '6m';
    const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN];
    const points = rangeToPoints(range);
    const baseTotal = profile.referringDomains;

    return HttpResponse.json({
      dataPoints: Array.from({ length: points }, (_, i) => {
        const total = Math.round(baseTotal * (0.7 + i * (0.3 / points)));
        return {
          date: new Date(Date.now() - (points - i) * 604800000).toISOString().slice(0, 10),
          total,
          newThisPeriod: faker.number.int({ min: 50, max: 500 }),
          lostThisPeriod: faker.number.int({ min: 10, max: 200 }),
        };
      }),
    });
  }),

  // ─── GET /api/domain-overview/traffic-by-country ─────────
  http.get('*/api/domain-overview/traffic-by-country', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'TW', name: 'Taiwan' },
      { code: 'JP', name: 'Japan' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'IN', name: 'India' },
      { code: 'BR', name: 'Brazil' },
    ];
    let remaining = 100;
    const result = countries.map((c, i) => {
      const pct = i < 9 ? faker.number.float({ min: 2, max: i === 0 ? 45 : 15, fractionDigits: 1 }) : remaining;
      remaining -= pct;
      return {
        countryCode: c.code,
        countryName: c.name,
        traffic: faker.number.int({ min: 10000, max: 2000000 }),
        percentage: Math.max(0, pct),
      };
    });

    return HttpResponse.json({ countries: result });
  }),

  // ─── GET /api/domain-overview/top-keywords ───────────────
  http.get('*/api/domain-overview/top-keywords', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    const limit = new URL(request.url).searchParams.get('limit') ?? '10';
    const keywords = Array.from({ length: parseInt(limit) }, () => ({
      keyword: faker.lorem.words({ min: 1, max: 4 }),
      position: faker.number.int({ min: 1, max: 20 }),
      traffic: faker.number.int({ min: 1000, max: 100000 }),
      volume: faker.number.int({ min: 5000, max: 200000 }),
      difficulty: faker.number.int({ min: 10, max: 95 }),
    }));

    return HttpResponse.json({ keywords });
  }),

  // ─── GET /api/domain-overview/link-type-distribution ─────
  http.get('*/api/domain-overview/link-type-distribution', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(150);

    const url = new URL(request.url);
    const domain = url.searchParams.get('domain') ?? PRIMARY_DOMAIN;
    const profile = DOMAIN_PROFILES[domain] ?? DOMAIN_PROFILES[PRIMARY_DOMAIN];
    const total = profile.backlinks;

    return HttpResponse.json({
      distribution: [
        { type: 'dofollow', count: Math.round(total * 0.755), percentage: 75.5 },
        { type: 'nofollow', count: Math.round(total * 0.171), percentage: 17.1 },
        { type: 'ugc', count: Math.round(total * 0.045), percentage: 4.5 },
        { type: 'sponsored', count: Math.round(total * 0.029), percentage: 2.9 },
      ],
    });
  }),

  // ─── GET /api/domain-overview/backlinks-new-lost ─────────
  http.get('*/api/domain-overview/backlinks-new-lost', async ({ request }) => {
    const authErr = requireAuth(request);
    if (authErr) return authErr;
    await delay(200);

    const range = new URL(request.url).searchParams.get('range') ?? '6m';
    const months = rangeToPoints(range) >= 26 ? 12 : 6;
    const now = new Date();

    return HttpResponse.json({
      dataPoints: Array.from({ length: months }, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (months - i));
        return {
          month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          new: faker.number.int({ min: 30000, max: 120000 }),
          lost: faker.number.int({ min: 5000, max: 40000 }),
        };
      }),
    });
  }),
];
