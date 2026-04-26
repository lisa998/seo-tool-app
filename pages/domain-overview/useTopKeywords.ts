import { computed, Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

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
  const { $axios } = useContext();
  const {
    loading: topKeywordsLoading,
    error: topKeywordsError,
    data: topKeywordsData,
    execute,
  } = useRequestState<TopKeywordsResp>();

  const fetchTopKeywords = () => {
    if (!targetDomain?.value) return;
    topKeywordsData.value = null;

    return execute(() =>
      $axios.$get<TopKeywordsResp>(`/api/domain-overview/top-keywords`, {
        params: {
          domain: targetDomain.value,
          limit: limit.value,
        },
      }),
    );
  };

  const topKeywordsChartData = computed(() => {
    const keywords = [...(topKeywordsData.value?.keywords ?? [])].sort((a, b) => b.traffic - a.traffic);

    return {
      categories: keywords.map(({ keyword }) => keyword),
      data: keywords.map(({ traffic }) => traffic),
      seriesName: '流量',
    };
  });

  return { fetchTopKeywords, topKeywordsLoading, topKeywordsError, topKeywordsData, topKeywordsChartData };
}
