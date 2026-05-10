export type RankTrackerKeywordsTab = 'all' | 'improved' | 'declined' | 'new';

export interface RankTrackerKeyword {
  id: string;
  keyword: string;
  position: {
    current: number;
    yesterday: number;
    weekAgo: number;
  };
  volume: number;
  tags: string[];
  sparkline: number[];
  url: string;
}

export interface RankTrackerKeywordsSummary {
  total: number;
  improved: number;
  declined: number;
  new: number;
}

export interface RankTrackerPagination {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface RankTrackerKeywordsResponse {
  data: RankTrackerKeyword[];
  summary: RankTrackerKeywordsSummary;
  pagination: RankTrackerPagination;
}

export interface RankTrackerDistributionPoint {
  date: string;
  top3: number;
  top10: number;
  top50: number;
  beyond50: number;
}

export interface RankTrackerDistributionResponse {
  dataPoints: RankTrackerDistributionPoint[];
}

export type RankTrackerKeywordBatchAction = 'addTag' | 'removeTag' | 'delete' | 'refreshRank';

export interface RankTrackerKeywordBatchPayload {
  action: RankTrackerKeywordBatchAction;
  keywordIds: string[];
  payload?: Record<string, unknown>;
}

export interface RankTrackerKeywordBatchResult {
  id: string;
  success: boolean;
  error?: string;
  kw?: { position: { current: number } };
}

export interface RankTrackerKeywordBatchResponse {
  affected: number;
  results: RankTrackerKeywordBatchResult[];
}

export interface RankTrackerTag {
  name: string;
  count: number;
  color: string;
}

export interface RankTrackerTagsResponse {
  tags: RankTrackerTag[];
}

export interface NotificationRulesFormType {
  ruleName: string;
  triggerCondition: string;
  threshold: number | null;
  notifyChannels: string[];
  enabled: boolean;
}

interface RankTrackerNotificationCondition {
  metric: string;
  threshold: number | null;
}

export interface RankTrackerNotificationRule {
  id: string;
  name: string;
  condition: RankTrackerNotificationCondition;
  channels: string[];
  enabled: boolean;
}

export interface RankTrackerNotificationRulesResponse {
  rules: RankTrackerNotificationRule[];
}

export interface CreateRankTrackerNotificationRulePayload {
  name?: string;
  condition?: RankTrackerNotificationCondition;
  channels?: string[];
}

const TagAction = ['addTag', 'removeTag'] as const;
export type TagActionType = (typeof TagAction)[number];
