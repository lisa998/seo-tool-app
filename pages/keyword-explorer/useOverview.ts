import { ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

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
  const overviewLoading = ref(false);
  const overviewError = ref<unknown>(null);

  const { $axios } = useContext();
  const fetchOverview = () =>
    withLoading(
      overviewLoading,
      async () => {
        if (!search.keyword) return;
        overviewData.value = null;
        const { metrics } = await $axios.$get(`/api/keyword/overview`, {
          params: {
            keyword: search.keyword,
          },
        });
        overviewData.value = metrics;
      },
      overviewError,
    );

  return { fetchOverview, overviewData, overviewLoading, overviewError };
}