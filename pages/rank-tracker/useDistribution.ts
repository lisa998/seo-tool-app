import { computed, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import type { RankTrackerDistributionResponse } from '~/pages/rank-tracker/types';

export default function () {
  const { $axios } = useContext();

  const {
    loading: distributionLoading,
    error: distributionError,
    data: distribution,
    execute,
  } = useRequestState<RankTrackerDistributionResponse>(null);

  const fetchDistribution = () => execute(() => $axios.$get('/api/rank-tracker/distribution'));

  const distributionChartData = computed(() => {
    const points = distribution.value?.dataPoints ?? [];
    return {
      xAxisCategories: points.map((p) => p.date),
      data: [
        { name: 'Top 3', data: points.map((p) => p.top3) },
        { name: 'Top 10', data: points.map((p) => p.top10) },
        { name: 'Top 50', data: points.map((p) => p.top50) },
        { name: 'Beyond 50', data: points.map((p) => p.beyond50) },
      ],
    };
  });

  return {
    distribution,
    fetchDistribution,
    distributionLoading,
    distributionError,
    distributionChartData,
  };
}
