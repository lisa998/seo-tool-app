import { computed, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

interface VolumeTrendItem {
  month: string;
  volume: number;
}

interface VolumeTrendResp {
  months: VolumeTrendItem[];
}

export default function (search: { keyword: string }) {
  const { $axios } = useContext();

  const volumeTrendData = ref<VolumeTrendItem[]>([]);
  const { loading: volumeTrendLoading, error: volumeTrendError, execute } = useRequestState();

  const fetchVolumeTrend = () =>
    execute(async () => {
      if (!search.keyword) return;
      volumeTrendData.value = [];
      const { months } = await $axios.$get<VolumeTrendResp>('/api/keyword/volume-trend', {
        params: {
          keyword: search.keyword,
        },
      });
      volumeTrendData.value = months;
    });

  const barData = computed(() => {
    if (volumeTrendData.value.length === 0) return { categories: [], data: [] };
    return {
      categories: volumeTrendData.value.map((item) => item.month),
      data: volumeTrendData.value.map((item) => item.volume),
    };
  });

  return { barData, fetchVolumeTrend, volumeTrendLoading, volumeTrendError };
}
