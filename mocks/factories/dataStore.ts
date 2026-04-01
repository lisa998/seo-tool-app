// mocks/factories/dataStore.ts
// 全域共享資料存儲 — 確保跨 API 資料一致性
// 所有 factory 都從這裡讀寫，pagination / filter / sort 都基於同一份資料

import {faker} from '@faker-js/faker'
import type {
    AnchorItem,
    AuditIssue,
    Backlink,
    BrokenLink,
    ContentItem,
    DashboardConfig,
    GapKeyword,
    NotificationRule,
    ReferringDomain,
    Tag,
    TrackedKeyword,
    UrlTreeNode,
    User,
} from '../types'

// ============================================================
// Seed — 保證每次刷新後資料一致
// ============================================================
faker.seed(42)

// ============================================================
// 共用常數
// ============================================================
export const DOMAINS = [
    'mysite.com',
    'competitor-a.com',
    'competitor-b.com',
    'competitor-c.com',
] as const

export const PRIMARY_DOMAIN = DOMAINS[0]

export const LINK_TYPES = ['dofollow', 'nofollow', 'ugc', 'sponsored'] as const
export const PLATFORMS = ['blog', 'news', 'wiki', 'forum', 'other'] as const
export const SEVERITIES = ['error', 'warning', 'notice'] as const
export const CATEGORIES = ['seo', 'performance', 'links', 'content', 'indexability'] as const

export const SERP_FEATURES = [
    'featured_snippet', 'people_also_ask', 'image_pack',
    'video', 'knowledge_panel', 'local_pack', 'top_stories',
    'shopping_results', 'site_links',
] as const

export const SOURCE_TYPES = ['education', 'news', 'government', 'blog', 'forum'] as const

export const TAG_COLORS: Record<string, string> = {
    brand: 'blue', priority: 'red', 'long-tail': 'green',
    seasonal: 'orange', competitor: 'purple',
}

// ============================================================
// 使用者
// ============================================================
export const CURRENT_USER: User = {
    id: 'usr_001',
    email: 'user@example.com',
    plan: 'pro',
    queryLimit: 500,
    queriesUsed: 42,
    locale: 'zh-TW',
}

export const MOCK_USERS = [
    {id: 'usr_001', name: 'Astor', color: '#3b82f6', avatar: 'https://i.pravatar.cc/150?img=1'},
    {id: 'usr_002', name: 'marketing', color: '#10b981', avatar: 'https://i.pravatar.cc/150?img=2'},
    {id: 'usr_003', name: 'SeoExpert', color: '#f59e0b', avatar: 'https://i.pravatar.cc/150?img=3'},
]

// ============================================================
// Token 管理
// ============================================================
export const VALID_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid'
export const VALID_REFRESH_TOKEN = 'dGhpcyBpcyBhIHJlZnJlc2g.valid'
export const EXPIRED_TOKEN = 'expired'

// 追蹤 refresh token 是否已被使用（模擬 rotation）
export let currentAccessToken = VALID_ACCESS_TOKEN
export let currentRefreshToken = VALID_REFRESH_TOKEN

export function rotateTokens(): { accessToken: string; refreshToken: string } {
    currentAccessToken = `eyJhbGciOiJIUzI1NiIs.${Date.now()}`
    currentRefreshToken = `dGhpcyBpcyBhIHJlZnJlc2g.${Date.now()}`
    return {accessToken: currentAccessToken, refreshToken: currentRefreshToken}
}

// ============================================================
// i18n
// ============================================================
export const I18N_MESSAGES: Record<string, Record<string, string>> = {
    'zh-TW': {
        'nav.siteExplorer': '網站分析',
        'nav.keywordExplorer': '關鍵字研究',
        'nav.domainOverview': '網域概覽',
        'nav.siteAudit': '網站健檢',
        'nav.rankTracker': '排名追蹤',
        'nav.contentExplorer': '內容探索',
        'nav.competitive': '競爭分析',
        'nav.contentGen': 'AI 內容生成',
        'common.search': '搜尋',
        'common.filter': '篩選',
        'common.export': '匯出',
        'common.loading': '載入中...',
        'error.rateLimit': '查詢過於頻繁，請稍後再試',
        'error.unauthorized': '請重新登入',
        'error.serverError': '伺服器錯誤，請稍後重試',
    },
    'en': {
        'nav.siteExplorer': 'Site Explorer',
        'nav.keywordExplorer': 'Keyword Explorer',
        'nav.domainOverview': 'Domain Overview',
        'nav.siteAudit': 'Site Audit',
        'nav.rankTracker': 'Rank Tracker',
        'nav.contentExplorer': 'Content Explorer',
        'nav.competitive': 'Competitive Dashboard',
        'nav.contentGen': 'AI Content Generator',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.export': 'Export',
        'common.loading': 'Loading...',
        'error.rateLimit': 'Too many requests, please try again later',
        'error.unauthorized': 'Please log in again',
        'error.serverError': 'Server error, please try again later',
    },
}

// ============================================================
// Domain ↔ Metrics 共享映射（保持跨 API 一致性）
// ============================================================
export interface DomainProfile {
    domain: string
    domainRating: number
    organicTraffic: number
    keywords: number
    backlinks: number
    referringDomains: number
    monthlyGrowth: number
}

export const DOMAIN_PROFILES: Record<string, DomainProfile> = {
    'mysite.com': {
        domain: 'mysite.com', domainRating: 45, organicTraffic: 12000,
        keywords: 1200, backlinks: 8400, referringDomains: 620, monthlyGrowth: 12.3,
    },
    'competitor-a.com': {
        domain: 'competitor-a.com', domainRating: 72, organicTraffic: 89000,
        keywords: 5700, backlinks: 45000, referringDomains: 3200, monthlyGrowth: 3.1,
    },
    'competitor-b.com': {
        domain: 'competitor-b.com', domainRating: 61, organicTraffic: 42000,
        keywords: 3200, backlinks: 28000, referringDomains: 1800, monthlyGrowth: 5.7,
    },
    'competitor-c.com': {
        domain: 'competitor-c.com', domainRating: 55, organicTraffic: 23000,
        keywords: 2100, backlinks: 15000, referringDomains: 980, monthlyGrowth: 8.2,
    },
}

// ============================================================
// 資料生成器 (lazy init — 呼叫時才生成，但只生成一次)
// ============================================================
let _backlinks: Backlink[] | null = null
let _referringDomains: ReferringDomain[] | null = null
let _anchors: AnchorItem[] | null = null
let _brokenLinks: BrokenLink[] | null = null
let _auditIssues: AuditIssue[] | null = null
let _urlTree: Map<string, UrlTreeNode[]> | null = null
let _trackedKeywords: TrackedKeyword[] | null = null
let _contentItems: ContentItem[] | null = null
let _gapKeywords: GapKeyword[] | null = null
let _dashboardConfig: DashboardConfig | null = null
let _notificationRules: NotificationRule[] | null = null

// ---------- helpers ----------
function dateInPast(maxDays: number): string {
    return faker.date.recent({days: maxDays}).toISOString()
}

function monthStr(monthsAgo: number): string {
    const d = new Date()
    d.setMonth(d.getMonth() - monthsAgo)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ---------- Backlinks ----------
export function getBacklinks(): Backlink[] {
    if (!_backlinks) {
        faker.seed(100)
        _backlinks = Array.from({length: 13000}, (_, i) => ({
            id: `bl_${String(i).padStart(5, '0')}`,
            sourceUrl: `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
            sourceTitle: faker.lorem.sentence({min: 4, max: 10}),
            sourceDR: faker.number.int({min: 1, max: 95}),
            sourceUR: faker.number.int({min: 1, max: 80}),
            anchor: faker.lorem.words({min: 1, max: 5}),
            targetUrl: `/${faker.lorem.slug()}`,
            linkType: faker.helpers.arrayElement([...LINK_TYPES]),
            platform: faker.helpers.arrayElement([...PLATFORMS]),
            traffic: faker.number.int({min: 0, max: 50000}),
            firstSeen: dateInPast(365),
            lastChecked: dateInPast(7),
        }))
    }
    return _backlinks
}

// ---------- Referring Domains ----------
export function getReferringDomains(): ReferringDomain[] {
    if (!_referringDomains) {
        faker.seed(200)
        _referringDomains = Array.from({length: 3847}, (_, i) => {
            const df = faker.number.int({min: 1, max: 20})
            const nf = faker.number.int({min: 0, max: 5})
            return {
                id: `rd_${String(i).padStart(4, '0')}`,
                domain: faker.internet.domainName(),
                domainRating: faker.number.int({min: 1, max: 95}),
                backlinksCount: df + nf,
                firstSeen: dateInPast(730),
                lastSeen: dateInPast(30),
                dofollow: df,
                nofollow: nf,
            }
        })
    }
    return _referringDomains
}

// ---------- Anchors ----------
export function getAnchors(): AnchorItem[] {
    if (!_anchors) {
        faker.seed(300)
        _anchors = Array.from({length: 1523}, () => ({
            anchor: faker.lorem.words({min: 1, max: 5}),
            referringDomains: faker.number.int({min: 1, max: 500}),
            backlinks: faker.number.int({min: 1, max: 2000}),
            firstSeen: dateInPast(730),
            traffic: faker.number.int({min: 0, max: 50000}),
        }))
    }
    return _anchors
}

// ---------- Broken Links ----------
export function getBrokenLinks(): BrokenLink[] {
    if (!_brokenLinks) {
        faker.seed(400)
        _brokenLinks = Array.from({length: 89}, () => ({
            sourceUrl: `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
            targetUrl: `/${faker.lorem.slug()}`,
            httpCode: faker.helpers.arrayElement([404, 410, 500]),
            anchor: faker.lorem.words({min: 1, max: 4}),
            sourceDR: faker.number.int({min: 1, max: 90}),
            referringDomains: faker.number.int({min: 1, max: 50}),
            firstSeen: dateInPast(365),
        }))
    }
    return _brokenLinks
}

// ---------- Audit Issues ----------
export function getAuditIssues(): AuditIssue[] {
    if (!_auditIssues) {
        faker.seed(500)
        const rules = [
            {rule: 'missing_h1', msg: '缺少 H1 標籤', sev: 'error' as const, cat: 'seo' as const},
            {rule: 'missing_meta', msg: '缺少 meta description', sev: 'warning' as const, cat: 'seo' as const},
            {rule: 'slow_page', msg: '頁面載入時間超過 3 秒', sev: 'warning' as const, cat: 'performance' as const},
            {rule: 'broken_link', msg: '頁面包含斷裂連結', sev: 'error' as const, cat: 'links' as const},
            {rule: 'thin_content', msg: '內容少於 300 字', sev: 'warning' as const, cat: 'content' as const},
            {rule: 'noindex', msg: '頁面被 noindex 標記', sev: 'notice' as const, cat: 'indexability' as const},
            {rule: 'duplicate_title', msg: '重複的 title 標籤', sev: 'warning' as const, cat: 'seo' as const},
            {rule: 'large_image', msg: '圖片未壓縮 (>500KB)', sev: 'warning' as const, cat: 'performance' as const},
            {rule: 'redirect_chain', msg: '重導向鏈超過 2 層', sev: 'error' as const, cat: 'links' as const},
            {rule: 'missing_alt', msg: '圖片缺少 alt 屬性', sev: 'notice' as const, cat: 'seo' as const},
        ]
        _auditIssues = Array.from({length: 259}, (_, i) => {
            const r = faker.helpers.arrayElement(rules)
            return {
                id: `issue_${String(i).padStart(3, '0')}`,
                rule: r.rule,
                severity: r.sev,
                category: r.cat,
                message: r.msg,
                affectedUrls: faker.number.int({min: 1, max: 50}),
                exampleUrl: `/${faker.lorem.slug()}`,
            }
        })
    }
    return _auditIssues
}

// ---------- URL Tree ----------
export function getUrlTree(): Map<string, UrlTreeNode[]> {
    if (!_urlTree) {
        faker.seed(600)
        _urlTree = new Map()
        const segments = ['blog', 'products', 'docs', 'about', 'pricing', 'tools', 'resources']
        _urlTree.set('/', segments.map(seg => ({
            segment: seg,
            fullPath: `/${seg}/`,
            type: 'directory' as const,
            pageCount: faker.number.int({min: 10, max: 1000}),
            errorCount: faker.number.int({min: 0, max: 20}),
            warningCount: faker.number.int({min: 0, max: 50}),
            hasChildren: true,
        })))
        // 為每個一級目錄建立子節點
        for (const seg of segments) {
            const childCount = faker.number.int({min: 2, max: 8})
            _urlTree.set(`/${seg}/`, Array.from({length: childCount}, () => {
                const child = faker.lorem.slug({min: 1, max: 2})
                return {
                    segment: child,
                    fullPath: `/${seg}/${child}/`,
                    type: faker.helpers.arrayElement(['directory', 'page']) as 'directory' | 'page',
                    pageCount: faker.number.int({min: 1, max: 200}),
                    errorCount: faker.number.int({min: 0, max: 5}),
                    warningCount: faker.number.int({min: 0, max: 15}),
                    hasChildren: faker.datatype.boolean(),
                }
            }))
        }
    }
    return _urlTree
}

// ---------- Tracked Keywords ----------
export function getTrackedKeywords(): TrackedKeyword[] {
    if (!_trackedKeywords) {
        faker.seed(700)
        const allTags = ['brand', 'priority', 'long-tail', 'seasonal', 'competitor']
        _trackedKeywords = Array.from({length: 248}, (_, i) => {
            const cur = faker.number.int({min: 1, max: 100})
            return {
                id: `kw_${String(i).padStart(3, '0')}`,
                keyword: faker.lorem.words({min: 1, max: 4}),
                position: {
                    current: cur,
                    yesterday: cur + faker.number.int({min: -5, max: 5}),
                    weekAgo: cur + faker.number.int({min: -15, max: 15}),
                },
                volume: faker.number.int({min: 100, max: 100000}),
                tags: faker.helpers.arrayElements(allTags, {min: 0, max: 3}),
                sparkline: Array.from({length: 7}, () =>
                    cur + faker.number.int({min: -10, max: 10})
                ),
                url: `/${faker.lorem.slug()}`,
            }
        })
    }
    return _trackedKeywords
}

// ---------- Content Items ----------
export function getContentItems(): ContentItem[] {
    if (!_contentItems) {
        faker.seed(800)
        _contentItems = Array.from({length: 2847}, (_, i) => ({
            id: `ct_${String(i).padStart(4, '0')}`,
            title: faker.lorem.sentence({min: 5, max: 12}),
            url: `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
            domain: faker.internet.domainName(),
            domainRating: faker.number.int({min: 1, max: 95}),
            publishedAt: dateInPast(365),
            excerpt: faker.lorem.paragraph(),
            ogImage: faker.image.url(),
            metrics: {
                socialShares: faker.number.int({min: 0, max: 50000}),
                backlinks: faker.number.int({min: 0, max: 2000}),
                referringDomains: faker.number.int({min: 0, max: 500}),
                organicTraffic: faker.number.int({min: 0, max: 100000}),
            },
        }))
    }
    return _contentItems
}

// ---------- Gap Keywords ----------
export function getGapKeywords(): GapKeyword[] {
    if (!_gapKeywords) {
        faker.seed(900)
        _gapKeywords = Array.from({length: 3000}, () => ({
            keyword: faker.lorem.words({min: 2, max: 5}),
            volume: faker.number.int({min: 100, max: 50000}),
            difficulty: faker.number.int({min: 1, max: 100}),
            competitorPositions: {
                'competitor-a.com': faker.helpers.maybe(() => faker.number.int({
                    min: 1,
                    max: 50
                }), {probability: 0.7}) ?? null,
                'competitor-b.com': faker.helpers.maybe(() => faker.number.int({
                    min: 1,
                    max: 50
                }), {probability: 0.5}) ?? null,
                'competitor-c.com': faker.helpers.maybe(() => faker.number.int({
                    min: 1,
                    max: 50
                }), {probability: 0.4}) ?? null,
            },
            myPosition: faker.helpers.maybe(() => faker.number.int({min: 1, max: 100}), {probability: 0.2}) ?? null,
        }))
    }
    return _gapKeywords
}

// ---------- Notification Rules ----------
export function getNotificationRules(): NotificationRule[] {
    if (!_notificationRules) {
        _notificationRules = [
            {
                id: 'rule_001',
                name: '排名下滑5位以上通知',
                condition: {metric: 'position_drop', threshold: 5},
                channels: ['email', 'browser'],
                enabled: true
            },
            {
                id: 'rule_002',
                name: '進入 Top 3 通知',
                condition: {metric: 'position_enter_top3', threshold: null},
                channels: ['email'],
                enabled: true
            },
            {
                id: 'rule_003',
                name: '流量下降20%通知',
                condition: {metric: 'traffic_drop_pct', threshold: 20},
                channels: ['browser'],
                enabled: false
            },
        ]
    }
    return _notificationRules
}

// ---------- Dashboard Config ----------
export function getDashboardConfig(): DashboardConfig {
    if (!_dashboardConfig) {
        _dashboardConfig = {
            layout: [
                {id: 'traffic-overlay', x: 0, y: 0, w: 8, h: 4},
                {id: 'radar', x: 8, y: 0, w: 4, h: 4},
                {id: 'scatter', x: 0, y: 4, w: 6, h: 3},
                {id: 'keyword-gap', x: 6, y: 4, w: 6, h: 3},
            ],
            panels: {
                'traffic-overlay': {visible: true, normalize: true},
                radar: {visible: true},
                scatter: {visible: true},
                'keyword-gap': {visible: true},
            },
        }
    }
    return _dashboardConfig
}

export function setDashboardConfig(config: DashboardConfig): void {
    _dashboardConfig = config
}

// ---------- Tags ----------
export function getTags(): Tag[] {
    const kws = getTrackedKeywords()
    const counts: Record<string, number> = {}
    for (const kw of kws) {
        for (const t of kw.tags) {
            counts[t] = (counts[t] ?? 0) + 1
        }
    }
    return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        color: TAG_COLORS[name] ?? 'gray',
    }))
}