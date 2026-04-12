import { computed, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

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
  const volumeTrendLoading = ref(false);

  const fetchVolumeTrend = () =>
    withLoading(volumeTrendLoading, async () => {
      if (!search.keyword) return;
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

  return { barData, fetchVolumeTrend, volumeTrendLoading };
}
