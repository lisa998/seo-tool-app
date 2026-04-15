import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

interface TopKeywordItem {
  keyword: string;
  position: number;
  traffic: number;
  volume: number;
  difficulty: number;
}

interface TopKeywordsResp {
  keywords: TopKeywordItem[];
}

export default function (targetDomain: Ref<string>, limit: Ref<number>) {
  const topKeywordsLoading = ref(false);
  const topKeywordsData = ref<TopKeywordsResp | null>(null);

  const { $axios } = useContext();

  const fetchTopKeywords = () =>
    withLoading(topKeywordsLoading, async () => {
      if (!targetDomain?.value) return;

      topKeywordsData.value = await $axios.$get<TopKeywordsResp>(`/api/domain-overview/top-keywords`, {
        params: {
          domain: targetDomain.value,
          limit: limit.value,
        },
      });
    });

  const topKeywordsChartData = computed(() => {
    const keywords = [...(topKeywordsData.value?.keywords ?? [])].sort((a, b) => b.traffic - a.traffic);

    return {
      categories: keywords.map(({ keyword }) => keyword),
      data: keywords.map(({ traffic }) => traffic),
      seriesName: '流量',
    };
  });

  return { fetchTopKeywords, topKeywordsLoading, topKeywordsData, topKeywordsChartData };
}
