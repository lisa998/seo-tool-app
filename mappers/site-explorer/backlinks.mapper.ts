import { formatYearMonth } from '~/utils/formatDate';

export interface BacklinksApiDto {
  anchor: string;
  firstSeen: string;
  id: string;
  lastChecked: string;
  linkType: string;
  platform: string;
  sourceDR: number;
  sourceTitle: string;
  sourceUR: number;
  sourceUrl: string;
  targetUrl: string;
  traffic: number;
}

export interface BacklinksViewModel {
  source: {
    title: string;
    url: string;
  };
  anchorTargetUrl: {
    text: string;
    url: string;
  };
  dr: number;
  ur: number;
  traffic: number;
  firstSeen: string;
}

export function backlinksMapper(api: BacklinksApiDto): BacklinksViewModel {
  return {
    source: {
      title: api.sourceTitle,
      url: api.sourceUrl,
    },
    anchorTargetUrl: {
      text: api.anchor,
      url: api.targetUrl,
    },
    dr: api.sourceDR,
    ur: api.sourceUR,
    traffic: api.traffic,
    firstSeen: formatYearMonth(api.firstSeen),
  };
}
