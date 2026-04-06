import { computed, Ref, ref, useContext, useFetch } from '@nuxtjs/composition-api';

interface VolumeTrendItem {
  month: string;
  volume: number;
}

interface VolumeTrendResp {
  months: VolumeTrendItem[];
}

export default function (search: Ref<{ keyword: string }>) {
  const { $axios } = useContext();

  const volumeTrendData = ref<VolumeTrendItem[]>([]);

  const { fetch: fetchVolumeTrend } = useFetch(async () => {
    if (!search.value.keyword) return;
    const { months } = await $axios.$get<VolumeTrendResp>('/api/keyword/volume-trend', {
      params: {
        keyword: search.value.keyword,
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

  return { barData, fetchVolumeTrend };
}
