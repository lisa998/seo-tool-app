import { formatYearMonth } from '~/utils/formatDate';

export interface BrokenLinksApiDto {
  sourceUrl: string;
  targetUrl: string;
  httpCode: number;
  anchor: string;
  sourceDR: number;
  referringDomains: number;
  firstSeen: string;
}

export interface BrokenLinksViewModel {
  sourceUrl: string;
  anchorTargetUrl: {
    text: string;
    url: string;
  };
  httpCode: number;
  sourceDR: number;
  referringDomains: number;
  firstSeen: string;
}

export function brokenLinksMapper(api: BrokenLinksApiDto): BrokenLinksViewModel {
  return {
    sourceUrl: api.sourceUrl,
    anchorTargetUrl: {
      text: api.anchor,
      url: api.targetUrl,
    },
    httpCode: api.httpCode,
    sourceDR: api.sourceDR,
    referringDomains: api.referringDomains,
    firstSeen: formatYearMonth(api.firstSeen),
  };
}
