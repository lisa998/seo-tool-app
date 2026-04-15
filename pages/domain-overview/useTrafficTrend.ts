import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

interface TrafficTrendDataPoint {
  date: string;
  organic: number;
  paid: number;
}

interface TrafficTrendResp {
  domain: string;
  range: string;
  granularity: string;
  dataPoints: TrafficTrendDataPoint[];
}

interface Series {
  name: string;
  data: number[];
}

export default function (targetDomain: Ref<string>, activeRange: Ref<string>) {
  const trafficTrendLoading = ref(false);
  const trafficTrendData = ref<TrafficTrendResp | null>(null);

  const { $axios } = useContext();

  const fetchTrafficTrend = () =>
    withLoading(trafficTrendLoading, async () => {
      if (!targetDomain?.value) return;

      trafficTrendData.value = await $axios.$get<TrafficTrendResp>(`/api/domain-overview/traffic-trend`, {
        params: {
          domain: targetDomain.value,
          range: activeRange.value,
        },
      });
    });
  const trafficTrendChartData = computed(() => {
    const xAxisCategories = [] as string[];
    const series = [
      { name: 'organic', data: [] },
      { name: 'paid', data: [] },
    ] as Series[];

    trafficTrendData?.value?.dataPoints.forEach(({ date, organic, paid }) => {
      xAxisCategories.push(date);
      series[0].data.push(organic);
      series[1].data.push(paid);
    });

    return { xAxisCategories, series };
  });

  return { fetchTrafficTrend, trafficTrendLoading, trafficTrendData, trafficTrendChartData };
}
