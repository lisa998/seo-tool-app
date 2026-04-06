import { Ref, ref, useContext, useFetch } from '@nuxtjs/composition-api';

const metrics = {
  volume: '月搜尋量',
  difficulty: '排名難度',
  cpc: '單次點擊成本',
  clicks: '預估點擊數',
  returnRate: '投資報酬率',
} as const;
type MetricsKey = keyof typeof metrics;
type OverviewMetrics = Record<MetricsKey, number>;
export const metricEntries = Object.entries(metrics) as [MetricsKey, string][];

export default function (search: Ref<{ keyword: string }>) {
  const overviewData = ref<OverviewMetrics | null>(null);

  const { $axios } = useContext();
  const { fetch: fetchOverview } = useFetch(async () => {
    if (!search.value.keyword) return;
    const { metrics } = await $axios.$get(`/api/keyword/overview`, {
      params: {
        keyword: search.value.keyword,
      },
    });
    overviewData.value = metrics;
  });

  return { fetchOverview, overviewData };
}
