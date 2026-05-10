import { TagActionType } from '~/pages/rank-tracker/types';

export const gridTemplate = 'grid-cols-[40px_1.8fr_1.7fr_1fr_1fr_1fr_1.3fr_1.1fr_1.6fr_56px]';

export const notiGridTemplate = `grid-cols-[2.5fr_2.5fr_2fr_1fr]`;

export const tabConfig = [
  {
    title: '追蹤關鍵字',
    value: 'all',
  },
  {
    title: '排名進步',
    value: 'improved',
  },
  {
    title: '排名退步',
    value: 'declined',
  },
  {
    title: '新進榜',
    value: 'new',
  },
];

export const columnConfig = [
  { title: '', key: 'checkbox', slot: true },
  { title: '關鍵字', key: 'keyword', slot: false },
  { title: 'Tags', key: 'tags', slot: true },
  { title: '現在', key: 'current', slot: true },
  { title: '昨天', key: 'yesterday', slot: false },
  { title: '7天前', key: 'sevenDaysAgo', slot: false },
  { title: '搜尋量', key: 'searchVolume', slot: false },
  { title: '變化', key: 'change', slot: true },
  { title: '趨勢', key: 'trend', slot: true },
  { title: '操作', key: 'actions', slot: true },
];

export const sortOptions = [
  {
    label: '排名由高到低',
    value: 'position_asc',
  },
  {
    label: '排名由低到高',
    value: 'position_desc',
  },
  {
    label: '排名進步最多',
    value: 'change_asc',
  },
  {
    label: '排名下降最多',
    value: 'change_desc',
  },
];

export const limitOptions = [25, 50, 100].map((num) => ({
  label: `${num}/頁`,
  value: num,
}));

export const notiColumnConfig = [
  { title: '規則名稱', key: 'ruleName', slot: false },
  { title: '條件', key: 'triggerCondition', slot: false },
  { title: '通知方式', key: 'notifyChannels', slot: false },
  { title: '狀態', key: 'enabled', slot: true },
];

export const operateTagButton: { label: string; value: TagActionType }[] = [
  { label: '新增標籖', value: 'addTag' },
  { label: '移除標籖', value: 'removeTag' },
];
