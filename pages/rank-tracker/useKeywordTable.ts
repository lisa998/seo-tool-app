import { computed, Ref } from '@nuxtjs/composition-api';
import type { RankTrackerKeywordsViewModelResponse } from '~/mappers/rank-tracker/keywords.mapper';

export default function useKeywordTable(
  keywords: Ref<RankTrackerKeywordsViewModelResponse | null>,
  activeSearch: Ref<string>,
) {
  const filteredKeywords = computed(() => {
    const data = keywords.value?.data || [];
    if (!activeSearch.value.trim()) return data;
    const search = activeSearch.value.toLowerCase();
    return data.filter((k) => k.keyword?.toLowerCase().includes(search));
  });

  const virtualTable = computed(() => {
    const data = filteredKeywords.value;
    return (startIndex: number, endIndex: number) => data.slice(startIndex, endIndex);
  });

  const keywordsLength = computed(() => filteredKeywords.value.length);

  return { filteredKeywords, virtualTable, keywordsLength };
}
