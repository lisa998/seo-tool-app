import { computed, ref, useContext } from '@nuxtjs/composition-api';

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

  const fetchVolumeTrend = async () => {
    if (!search.keyword) return;
    volumeTrendLoading.value = true;
    const { months } = await $axios.$get<VolumeTrendResp>('/api/keyword/volume-trend', {
      params: {
        keyword: search.keyword,
      },
    });
    volumeTrendData.value = months;
    volumeTrendLoading.value = false;
  };

  const barData = computed(() => {
    if (volumeTrendData.value.length === 0) return { categories: [], data: [] };
    return {
      categories: volumeTrendData.value.map((item) => item.month),
      data: volumeTrendData.value.map((item) => item.volume),
    };
  });

  return { barData, fetchVolumeTrend, volumeTrendLoading };
}
