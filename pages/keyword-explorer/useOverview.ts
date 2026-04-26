import { ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

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

export default function (search: { keyword: string }) {
  const overviewData = ref<OverviewMetrics | null>(null);

  const { $axios } = useContext();
  const { loading: overviewLoading, error: overviewError, execute } = useRequestState();
  const fetchOverview = () =>
    execute(async () => {
      if (!search.keyword) return;
      overviewData.value = null;
      const { metrics } = await $axios.$get(`/api/keyword/overview`, {
        params: {
          keyword: search.keyword,
        },
      });
      overviewData.value = metrics;
    });

  return { fetchOverview, overviewData, overviewLoading, overviewError };
}
