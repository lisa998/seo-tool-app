import { formatYearMonth } from '~/utils/formatDate';

export interface AnchorsApiDto {
  anchor: string;
  referringDomains: number;
  backlinks: number;
  firstSeen: string;
  traffic: number;
}

export interface AnchorsViewModel {
  anchor: string;
  traffic: number;
  backlinks: number;
  referringDomains: number;
  firstSeen: string;
}

export function anchorsMapper(api: AnchorsApiDto): AnchorsViewModel {
  return {
    anchor: api.anchor,
    traffic: api.traffic,
    backlinks: api.backlinks,
    referringDomains: api.referringDomains,
    firstSeen: formatYearMonth(api.firstSeen),
  };
}
