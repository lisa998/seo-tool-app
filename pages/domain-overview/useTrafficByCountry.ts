import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

interface TrafficByCountryItem {
  countryCode: string;
  countryName: string;
  traffic: number;
  percentage: number;
}

interface TrafficByCountryResp {
  countries: TrafficByCountryItem[];
}

export default function (targetDomain: Ref<string>) {
  const trafficByCountryLoading = ref(false);
  const trafficByCountryData = ref<TrafficByCountryResp | null>(null);

  const { $axios } = useContext();

  const fetchTrafficByCountry = () =>
    withLoading(trafficByCountryLoading, async () => {
      if (!targetDomain?.value) return;

      trafficByCountryData.value = await $axios.$get<TrafficByCountryResp>(`/api/domain-overview/traffic-by-country`, {
        params: {
          domain: targetDomain.value,
        },
      });
    });

  const trafficByCountryChartData = computed(() => {
    const countries = [...(trafficByCountryData.value?.countries ?? [])].sort((a, b) => b.traffic - a.traffic);

    return {
      categories: countries.map(({ countryName }) => countryName),
      data: countries.map(({ traffic }) => traffic),
      seriesName: '流量',
    };
  });

  return { fetchTrafficByCountry, trafficByCountryLoading, trafficByCountryData, trafficByCountryChartData };
}
