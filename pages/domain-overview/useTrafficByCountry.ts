import { computed, Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

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
  const { $axios } = useContext();
  const {
    loading: trafficByCountryLoading,
    error: trafficByCountryError,
    data: trafficByCountryData,
    execute,
  } = useRequestState<TrafficByCountryResp>();

  const fetchTrafficByCountry = () => {
    if (!targetDomain?.value) return;
    trafficByCountryData.value = null;

    return execute(() =>
      $axios.$get<TrafficByCountryResp>(`/api/domain-overview/traffic-by-country`, {
        params: {
          domain: targetDomain.value,
        },
      }),
    );
  };

  const trafficByCountryChartData = computed(() => {
    const countries = [...(trafficByCountryData.value?.countries ?? [])].sort((a, b) => b.traffic - a.traffic);

    return {
      categories: countries.map(({ countryName }) => countryName),
      data: countries.map(({ traffic }) => traffic),
      seriesName: '流量',
    };
  });

  return {
    fetchTrafficByCountry,
    trafficByCountryLoading,
    trafficByCountryError,
    trafficByCountryData,
    trafficByCountryChartData,
  };
}
