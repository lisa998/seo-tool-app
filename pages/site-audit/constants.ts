import { CategoryType, RuleType } from '~/pages/site-audit/useRunner';

export const progressStatusMap: Record<string, string> = {
  reconnecting: 'warning',
  error: 'exception',
  completed: 'success',
};

export const issueTagMap = {
  error: 'danger',
  warning: 'warning',
  notice: 'info',
};

export const issueTypeMap: Record<RuleType, string> = {
  missing_h1: '缺少 H1 標籤',
  missing_meta: '缺少 Meta 描述',
  slow_page: '頁面載入速度過慢',
  broken_link: '壞連結',
  thin_content: '內容過少',
  large_image: '圖片過大',
};

export const issueCategoryMap: Record<CategoryType, string> = {
  seo: 'SEO',
  performance: 'Performance',
  links: 'Links',
  content: 'Content',
  indexability: 'Indexability',
};

export const customColors = [
  { color: '#C96455', percentage: 25 },
  { color: '#D89A52', percentage: 50 },
  { color: '#A48677', percentage: 75 },
];

export const formatCircleProgress = (percentage: number) => percentage;

export const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'SEO', value: 'seo' },
  { label: 'Performance', value: 'performance' },
  { label: 'Links', value: 'links' },
  { label: 'Content', value: 'content' },
  { label: 'Indexability', value: 'indexability' },
];

export const severityOptions = [
  { label: 'All', value: 'all' },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warning' },
  { label: 'Notice', value: 'notice' },
];
