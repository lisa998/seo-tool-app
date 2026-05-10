import type {
  RankTrackerKeyword,
  RankTrackerKeywordsResponse,
  RankTrackerKeywordsSummary,
  RankTrackerPagination,
} from '~/pages/rank-tracker/types';

export interface RankTrackerKeywordViewModel {
  id: string;
  checkbox: string;
  keyword: string;
  tags: string[];
  current: number;
  yesterday: number;
  sevenDaysAgo: number;
  searchVolume: number;
  change: number;
  trend: number[];
  actions: string;
  url: string;
}

export interface RankTrackerKeywordsViewModelResponse {
  data: RankTrackerKeywordViewModel[];
  summary: RankTrackerKeywordsSummary;
  pagination: RankTrackerPagination;
}

export function keywordsMapper(api: RankTrackerKeyword): RankTrackerKeywordViewModel {
  const current = api.position.current;
  const sevenDaysAgo = api.position.weekAgo;

  return {
    id: api.id,
    checkbox: '',
    keyword: api.keyword,
    tags: api.tags,
    current,
    yesterday: api.position.yesterday,
    sevenDaysAgo,
    searchVolume: api.volume,
    change: sevenDaysAgo - current,
    trend: api.sparkline,
    actions: '',
    url: api.url,
  };
}

export function keywordsResponseMapper(api: RankTrackerKeywordsResponse): RankTrackerKeywordsViewModelResponse {
  return {
    data: api.data.map(keywordsMapper),
    summary: api.summary,
    pagination: api.pagination,
  };
}
