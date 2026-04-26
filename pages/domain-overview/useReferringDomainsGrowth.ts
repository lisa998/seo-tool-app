import { computed, Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import { chartColors } from '~/components/chart/chartTheme';
import { executeCache } from '~/composables/useCachedFetch';

interface ReferringDomainsGrowthDataPoint {
  date: string;
  total: number;
  newThisPeriod: number;
  lostThisPeriod: number;
}

interface ReferringDomainsGrowthResp {
  dataPoints: ReferringDomainsGrowthDataPoint[];
}

interface Series {
  name: string;
  data: number[];
  yAxis: number;
  color: string;
}

export default function (targetDomain: Ref<string>, activeRange: Ref<string>) {
  const { $axios } = useContext();
  const {
    loading: referringDomainsGrowthLoading,
    error: referringDomainsGrowthError,
    data: referringDomainsGrowthData,
    execute,
  } = useRequestState<ReferringDomainsGrowthResp>();

  const fetchReferringDomainsGrowth = () => {
    if (!targetDomain?.value) return;
    referringDomainsGrowthData.value = null;

    return execute(() =>
      executeCache<ReferringDomainsGrowthResp>(
        `${targetDomain.value}:${activeRange.value}:referringDomainsGrowth`,
        () =>
          $axios.$get<ReferringDomainsGrowthResp>(`/api/domain-overview/referring-domains-growth`, {
            params: {
              domain: targetDomain.value,
              range: activeRange.value,
            },
          }),
      ),
    );
  };

  const referringDomainsGrowthChartData = computed(() => {
    const xAxisCategories = [] as string[];
    const series: Series[] = [
      { name: '總數', data: [], yAxis: 0, color: chartColors.primaryActive },
      { name: '新增', data: [], yAxis: 1, color: chartColors.success },
      { name: '流失', data: [], yAxis: 1, color: chartColors.danger },
    ];

    referringDomainsGrowthData.value?.dataPoints.forEach(({ date, total, newThisPeriod, lostThisPeriod }) => {
      xAxisCategories.push(date);
      series[0].data.push(total);
      series[1].data.push(newThisPeriod);
      series[2].data.push(lostThisPeriod);
    });

    return { xAxisCategories, series };
  });

  return {
    fetchReferringDomainsGrowth,
    referringDomainsGrowthLoading,
    referringDomainsGrowthError,
    referringDomainsGrowthData,
    referringDomainsGrowthChartData,
  };
}
