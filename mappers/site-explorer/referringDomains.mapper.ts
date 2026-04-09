import { formatYearMonth } from '~/utils/formatDate';

export interface ReferringDomainsApiDto {
  id: string;
  domain: string;
  domainRating: number;
  backlinksCount: number;
  firstSeen: string;
  lastSeen: string;
  dofollow: number;
  nofollow: number;
}

export interface ReferringDomainsViewModel {
  domain: string;
  domainRating: number;
  dofollow: number;
  nofollow: number;
  backlinksCount: number;
  firstSeen: string;
  lastSeen: string;
}

export function referringDomainsMapper(api: ReferringDomainsApiDto): ReferringDomainsViewModel {
  return {
    domain: api.domain,
    domainRating: api.domainRating,
    dofollow: api.dofollow,
    nofollow: api.nofollow,
    backlinksCount: api.backlinksCount,
    firstSeen: formatYearMonth(api.firstSeen),
    lastSeen: formatYearMonth(api.lastSeen),
  };
}
