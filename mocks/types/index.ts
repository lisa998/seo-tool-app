// mocks/types/index.ts
// 所有 API 共用的 TypeScript 型別定義

// ============================================================
// Common
// ============================================================
export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface ApiError {
  error: string;
  message: string;
  retryAfter?: number;
}

// ============================================================
// Auth
// ============================================================
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'lite' | 'standard' | 'pro';
  queryLimit: number;
  queriesUsed: number;
  locale: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface I18nMessages {
  locale: string;
  messages: Record<string, string>;
}

// ============================================================
// Site Explorer
// ============================================================
export interface SiteOverview {
  domain: string;
  metrics: {
    domainRating: number;
    backlinks: number;
    referringDomains: number;
    organicTraffic: number;
  };
  sparklines: {
    domainRating: number[];
    backlinks: number[];
    referringDomains: number[];
    organicTraffic: number[];
  };
}

export interface Backlink {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDR: number;
  sourceUR: number;
  anchor: string;
  targetUrl: string;
  linkType: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored';
  platform: 'blog' | 'news' | 'wiki' | 'forum' | 'other';
  traffic: number;
  firstSeen: string;
  lastChecked: string;
}

export interface ReferringDomain {
  id: string;
  domain: string;
  domainRating: number;
  backlinksCount: number;
  firstSeen: string;
  lastSeen: string;
  dofollow: number;
  nofollow: number;
}

export interface AnchorItem {
  anchor: string;
  referringDomains: number;
  backlinks: number;
  firstSeen: string;
  traffic: number;
}

export interface BrokenLink {
  sourceUrl: string;
  targetUrl: string;
  httpCode: number;
  anchor: string;
  sourceDR: number;
  referringDomains: number;
  firstSeen: string;
}

// ============================================================
// Domain Overview
// ============================================================
export interface DomainSummary {
  domain: string;
  ahrefsRank: number;
  ahrefsRankDelta: number;
  domainRating: number;
  domainRatingDelta: number;
  backlinks: number;
  backlinksDelta: number;
  referringDomains: number;
  organicTraffic: number;
  organicKeywords: number;
}

export interface TrafficDataPoint {
  date: string;
  organic: number;
  paid: number;
}

export interface ReferringDomainsGrowthPoint {
  date: string;
  total: number;
  newThisPeriod: number;
  lostThisPeriod: number;
}

export interface CountryTraffic {
  countryCode: string;
  countryName: string;
  traffic: number;
  percentage: number;
}

export interface TopKeyword {
  keyword: string;
  position: number;
  traffic: number;
  volume: number;
  difficulty: number;
}

export interface LinkTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface BacklinksNewLost {
  month: string;
  new: number;
  lost: number;
}

// ============================================================
// Keyword Explorer
// ============================================================
export interface KeywordSuggestion {
  keyword: string;
  volume: number;
  difficulty: number;
}

export interface KeywordOverview {
  keyword: string;
  db: string;
  metrics: {
    volume: number;
    difficulty: number;
    cpc: number;
    clicks: number;
    returnRate: number;
  };
}

export interface SerpResult {
  position: number;
  url: string;
  title: string;
  domainRating: number;
  urlRating: number;
  backlinks: number;
  traffic: number;
  featuredSnippet: boolean;
}

export interface VolumeTrendPoint {
  month: string;
  volume: number;
}

export interface SerpFeaturesHistoryPoint {
  date: string;
  features: string[];
}

// ============================================================
// Site Audit
// ============================================================
export interface AuditStartResponse {
  auditId: string;
  status: string;
  estimatedDuration: number;
  streamUrl: string;
}

export interface AuditProgressEvent {
  pagesScanned: number;
  totalPages: number;
  speed: number;
  errors: number;
  warnings: number;
}

export interface AuditIssue {
  id: string;
  rule: string;
  severity: 'error' | 'warning' | 'notice';
  category: 'seo' | 'performance' | 'links' | 'content' | 'indexability';
  message: string;
  affectedUrls: number;
  exampleUrl: string;
}

export interface AuditReport {
  auditId: string;
  domain: string;
  completedAt: string;
  healthScore: number;
  summary: { errors: number; warnings: number; notices: number };
  categories: Array<{
    name: string;
    errors: number;
    warnings: number;
    notices: number;
  }>;
}

export interface UrlTreeNode {
  segment: string;
  fullPath: string;
  type: 'directory' | 'page';
  pageCount: number;
  errorCount: number;
  warningCount: number;
  hasChildren: boolean;
}

// ============================================================
// Rank Tracker
// ============================================================
export interface TrackedKeyword {
  id: string;
  keyword: string;
  position: { current: number; yesterday: number; weekAgo: number };
  volume: number;
  tags: string[];
  sparkline: number[];
  url: string;
}

export interface RankDistributionPoint {
  date: string;
  top3: number;
  top10: number;
  top50: number;
  beyond50: number;
}

export interface Tag {
  name: string;
  count: number;
  color: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: { metric: string; threshold: number | null };
  channels: string[];
  enabled: boolean;
}

// ============================================================
// Content Explorer
// ============================================================
export interface ContentItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  domainRating: number;
  publishedAt: string;
  excerpt: string;
  ogImage: string;
  metrics: {
    socialShares: number;
    backlinks: number;
    referringDomains: number;
    organicTraffic: number;
  };
}

export interface TrendingItem {
  id: string;
  title: string;
  domain: string;
  socialShares: number;
  shareGrowth: number;
}

// ============================================================
// Competitive Dashboard
// ============================================================
export interface CompetitorComparison {
  domain: string;
  metrics: Record<string, { value: number; rank: number }>;
}

export interface TrafficOverlaySeries {
  domain: string;
  color: string;
  dataPoints: Array<{ date: string; value: number; normalized: number }>;
}

export interface GapKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  competitorPositions: Record<string, number | null>;
  myPosition: number | null;
}

export interface BacklinkSourceMatrix {
  domain: string;
  counts: Record<string, number>;
}

export interface ContentVelocityMonth {
  month: string;
  counts: Record<string, number>;
}

export interface MarketShareSegment {
  domain: string;
  share: number;
  keywords: number;
  children?: Array<{ category: string; share: number; keywords: number }>;
}

export interface DashboardConfig {
  layout: Array<{ id: string; x: number; y: number; w: number; h: number }>;
  panels: Record<string, { visible: boolean; [key: string]: unknown }>;
}

// ============================================================
// AI Content Generator
// ============================================================
export interface KeywordAnalysis {
  keyword: string;
  db: string;
  volume: number;
  difficulty: number;
  suggestedWordCount: { min: number; max: number };
  relatedKeywords: Array<{ keyword: string; volume: number }>;
  serpCompetitors: Array<{ title: string; url: string; wordCount: number; dr: number }>;
}

export interface TitleSuggestion {
  index: number;
  title: string;
  score: number;
}

export interface OutlineSection {
  id: string;
  level: 'h2' | 'h3';
  parentId?: string;
  title: string;
  estimatedWords: number;
}

export interface SeoScoreCheck {
  category: string;
  name: string;
  status: 'pass' | 'warning' | 'error';
  score: number;
  message: string;
  icon: string;
}

export interface SeoScore {
  overallScore: number;
  recommendation: string;
  checks: SeoScoreCheck[];
  keywordDensity: {
    primary: { keyword: string; count: number; density: number; recommended: string };
    secondary: Array<{ keyword: string; count: number; found: boolean }>;
  };
}

export interface EditorVersion {
  version: number;
  savedAt: string;
  savedBy: { id: string; name: string };
  wordCount: number;
  changesSummary: string;
}

export interface AiSuggestion {
  id: string;
  range: { from: number; to: number };
  original: string;
  suggested: string;
  reason: string;
  type: 'grammar' | 'style' | 'seo';
}
