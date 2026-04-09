import { type BacklinksViewModel } from '~/mappers/site-explorer/backlinks.mapper';
import { type BrokenLinksViewModel } from '~/mappers/site-explorer/brokenLinks';
import { type AnchorsViewModel } from '~/mappers/site-explorer/anchors.mapper';
import { type ReferringDomainsViewModel } from '~/mappers/site-explorer/referringDomains.mapper';
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

type ColumnConfigItem<T extends object> = {
  title: string;
  key: Extract<keyof T, string>;
  slot: boolean;
};

type ColumnConfigMap = {
  backlinks: ColumnConfigItem<BacklinksViewModel>[];
  'referring-domains': ColumnConfigItem<ReferringDomainsViewModel>[];
  anchors: ColumnConfigItem<AnchorsViewModel>[];
  'broken-links': ColumnConfigItem<BrokenLinksViewModel>[];
};

type GridTemplateMap = Record<LinkAnalysisKey, string>;

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

const backLinksColumnConfig: ColumnConfigItem<BacklinksViewModel>[] = [
  { title: '來源頁面', key: 'source', slot: true },
  { title: '錨文本/目標URL', key: 'anchorTargetUrl', slot: true },
  { title: 'DR', key: 'dr', slot: false },
  { title: 'UR', key: 'ur', slot: false },
  { title: '流量', key: 'traffic', slot: false },
  { title: '首見日期', key: 'firstSeen', slot: false },
];

const referringDomainsColumnConfig: ColumnConfigItem<ReferringDomainsViewModel>[] = [
  { title: '參照網域', key: 'domain', slot: false },
  { title: 'DR', key: 'domainRating', slot: false },
  { title: 'Dofollow', key: 'dofollow', slot: false },
  { title: 'Nofollow', key: 'nofollow', slot: false },
  { title: '反連數', key: 'backlinksCount', slot: false },
  { title: '首見日期', key: 'firstSeen', slot: false },
  { title: '最後發現', key: 'lastSeen', slot: false },
];

const anchorsColumnConfig: ColumnConfigItem<AnchorsViewModel>[] = [
  { title: '錨文本', key: 'anchor', slot: false },
  { title: '流量', key: 'traffic', slot: false },
  { title: '反連數', key: 'backlinks', slot: false },
  { title: '參照網域數', key: 'referringDomains', slot: false },
  { title: '首見日期', key: 'firstSeen', slot: false },
];

const brokenLinksColumnConfig: ColumnConfigItem<BrokenLinksViewModel>[] = [
  { title: '來源頁面', key: 'sourceUrl', slot: false },
  { title: '錨文本/目標URL', key: 'anchorTargetUrl', slot: true },
  { title: 'HTTP 狀態碼', key: 'httpCode', slot: false },
  { title: 'DR', key: 'sourceDR', slot: false },
  { title: '參照網域數', key: 'referringDomains', slot: false },
  { title: '首見日期', key: 'firstSeen', slot: false },
];

export const gridTemplateMap: GridTemplateMap = {
  backlinks: 'grid-cols-[6fr_3fr_1fr_1fr_1.5fr_2fr]',
  'referring-domains': 'grid-cols-[3fr_1fr_1.5fr_1.5fr_1.5fr_2fr_2fr]',
  anchors: 'grid-cols-[4fr_2fr_2fr_2fr_2fr]',
  'broken-links': 'grid-cols-[6fr_3fr_3fr_1fr_2.5fr_2fr]',
};

export const columnConfigMap: ColumnConfigMap = {
  backlinks: backLinksColumnConfig,
  'referring-domains': referringDomainsColumnConfig,
  anchors: anchorsColumnConfig,
  'broken-links': brokenLinksColumnConfig,
};
