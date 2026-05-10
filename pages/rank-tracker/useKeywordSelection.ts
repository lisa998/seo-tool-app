import { ref, Ref, watch } from '@nuxtjs/composition-api';
import type { RankTrackerKeywordsViewModelResponse } from '~/mappers/rank-tracker/keywords.mapper';

export default function useKeywordSelection(keywords: Ref<RankTrackerKeywordsViewModelResponse | null>) {
  const selectKeywordIds = ref<string[]>([]);
  const checkedAll = ref(false);

  const isKeywordSelected = (keywordId: string) => selectKeywordIds.value.includes(keywordId);

  const toggleSelect = (isSelect: boolean, keywordId: string) => {
    if (isSelect && !isKeywordSelected(keywordId)) {
      selectKeywordIds.value.push(keywordId);
    } else {
      selectKeywordIds.value = selectKeywordIds.value.filter((k) => k !== keywordId);
    }
  };

  watch(checkedAll, () => {
    if (checkedAll.value && keywords.value?.data.length) {
      selectKeywordIds.value = keywords.value.data.map((k) => k.id);
    } else {
      selectKeywordIds.value = [];
    }
  });

  const cancelCheckedAll = () => {
    checkedAll.value = false;
    selectKeywordIds.value = [];
  };

  return { selectKeywordIds, checkedAll, isKeywordSelected, toggleSelect, cancelCheckedAll };
}
