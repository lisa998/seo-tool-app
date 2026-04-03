import { LinkAnalysisKey } from '~/pages/site-explorer/useApiQuery';

interface Option<T> {
  label: string;
  value: T;
}

interface Selector {
  label: string;
  param: string;
  options: OptionGroup[];
}

type OptionUnion<T extends unknown[]> = {
  [K in keyof T]: Option<T[K]>;
};
type OptionGroup = OptionUnion<ApiOptions>[number];

export interface TabConfigItem {
  label: string;
  apiPath: string;
  selectors: Selector[];
}

//api params options
export const LINK_TYPES = ['dofollow', 'nofollow', 'ugc', 'sponsored'] as const;
export const PLATFORMS = ['blog', 'news', 'wiki', 'forum', 'other'] as const;
export const BACKLINK_SORTS = ['dr_desc', 'ur_desc', 'traffic_desc', 'firstSeen_desc'] as const;
export const REFERRING_DOMAIN_SORTS = ['domainRating_desc', 'backlinksCount_desc', 'firstSeen_desc'] as const;
export const ANCHOR_SORTS = ['referringDomains_desc', 'backlinks_desc', 'traffic_desc'] as const;
export const HTTP_CODES = [404, 410, 500] as const;

type ApiOptions = [
  (typeof LINK_TYPES)[number],
  (typeof PLATFORMS)[number],
  (typeof BACKLINK_SORTS)[number],
  (typeof REFERRING_DOMAIN_SORTS)[number],
  (typeof ANCHOR_SORTS)[number],
  (typeof HTTP_CODES)[number],
];
export const tabConfig: Record<LinkAnalysisKey, TabConfigItem> = {
  backlinks: {
    label: '反向連結',
    apiPath: '/backlinks',
    selectors: [
      {
        label: '連結類型',
        param: 'linkType',
        options: [
          { label: 'Dofollow', value: 'dofollow' },
          { label: 'Nofollow', value: 'nofollow' },
          { label: '使用者生成內容', value: 'ugc' },
          { label: '贊助', value: 'sponsored' },
        ],
      },
      {
        label: '平台',
        param: 'platform',
        options: [
          { label: '部落格', value: 'blog' },
          { label: '新聞', value: 'news' },
          { label: '維基', value: 'wiki' },
          { label: '論壇', value: 'forum' },
          { label: '其他', value: 'other' },
        ],
      },
      {
        label: '排序',
        param: 'sort',
        options: [
          { label: 'DR 高到低', value: 'dr_desc' },
          { label: 'UR 高到低', value: 'ur_desc' },
          { label: '流量高到低', value: 'traffic_desc' },
          { label: '最近發現', value: 'firstSeen_desc' },
        ],
      },
    ],
  },
  'referring-domains': {
    label: '參照網域',
    apiPath: '/referring-domains',
    selectors: [
      {
        label: '排序',
        param: 'sort',
        options: [
          { label: 'Domain Rating 高到低', value: 'domainRating_desc' },
          { label: '反連數高到低', value: 'backlinksCount_desc' },
          { label: '最早發現', value: 'firstSeen_desc' },
        ],
      },
    ],
  },
  anchors: {
    label: '錨文本',
    apiPath: '/anchors',
    selectors: [
      {
        label: '排序',
        param: 'sort',
        options: [
          { label: '參照網域數高到低', value: 'referringDomains_desc' },
          { label: '反連數高到低', value: 'backlinks_desc' },
          { label: '流量高到低', value: 'traffic_desc' },
        ],
      },
    ],
  },
  'broken-links': {
    label: '斷裂連結',
    apiPath: '/broken-links',
    selectors: [
      {
        label: 'HTTP 狀態碼',
        param: 'httpCode',
        options: [
          { label: '404 Not Found', value: 404 },
          { label: '410 Gone', value: 410 },
          { label: '500 Server Error', value: 500 },
        ],
      },
    ],
  },
};
