import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { chartColors } from '~/components/chart/chartTheme';

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
  const referringDomainsGrowthLoading = ref(false);
  const referringDomainsGrowthData = ref<ReferringDomainsGrowthResp | null>(null);

  const { $axios } = useContext();

  const fetchReferringDomainsGrowth = () =>
    withLoading(referringDomainsGrowthLoading, async () => {
      if (!targetDomain?.value) return;

      referringDomainsGrowthData.value = await $axios.$get<ReferringDomainsGrowthResp>(
        `/api/domain-overview/referring-domains-growth`,
        {
          params: {
            domain: targetDomain.value,
            range: activeRange.value,
          },
        },
      );
    });

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
    referringDomainsGrowthData,
    referringDomainsGrowthChartData,
  };
}
