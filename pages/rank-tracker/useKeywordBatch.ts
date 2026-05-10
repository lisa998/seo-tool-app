import { Ref, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import type {
  RankTrackerKeywordBatchPayload,
  RankTrackerKeywordBatchResponse,
  TagActionType,
} from '~/pages/rank-tracker/types';
import { RankTrackerKeywordsViewModelResponse } from '~/mappers/rank-tracker/keywords.mapper';

export default function (selectKeywordIds: Ref<string[]>, keywords: Ref<RankTrackerKeywordsViewModelResponse | null>) {
  const { $axios } = useContext();

  const {
    loading: keywordBatchLoading,
    error: keywordBatchError,
    data: keywordBatchResult,
    execute,
  } = useRequestState<RankTrackerKeywordBatchResponse>(null);

  const executeKeywordBatch = (payload: RankTrackerKeywordBatchPayload) =>
    execute(() => $axios.$post('/api/rank-tracker/keywords/batch', payload));

  const onKeywordBatch = async (action: 'delete' | 'refreshRank') => {
    if (!selectKeywordIds.value.length) return;

    await executeKeywordBatch({ action, keywordIds: selectKeywordIds.value });

    if (action === 'refreshRank') {
      keywordBatchResult.value?.results.forEach(({ id, success, kw }) => {
        if (!success || !kw) return;
        const keyword = keywords.value?.data?.find((k) => k.id === id);
        if (keyword) keyword.current = kw.position.current;
      });
    }
    if (action === 'delete') {
      // 無 mock api
      const deletedIdsSet = new Set(
        keywordBatchResult.value?.results.filter(({ success }) => success).map(({ id }) => id),
      );
      if (deletedIdsSet?.size) {
        keywords.value!.data = keywords.value!.data.filter((k) => !deletedIdsSet.has(k.id));
        selectKeywordIds.value = selectKeywordIds.value.filter((id) => !deletedIdsSet.has(id));
      }
    }
  };
  const operateAction = ref<TagActionType>('addTag');
  const editTagWaring = ref(false);
  const batchFailedIds = ref<string[]>([]);
  const operateTag = ref('');

  const onEditTag = async () => {
    if (!operateTag.value.trim() || !selectKeywordIds.value.length) {
      editTagWaring.value = true;
      return;
    }
    editTagWaring.value = false;
    batchFailedIds.value = [];

    await executeKeywordBatch({
      action: operateAction.value,
      keywordIds: selectKeywordIds.value,
      payload: { tag: operateTag.value },
    });

    keywordBatchResult.value?.results.forEach(({ id, success }) => {
      if (success) {
        const keyword = keywords.value?.data?.find((k) => k.id === id);
        if (!keyword) return;
        if (operateAction.value === 'addTag') {
          if (!keyword.tags.includes(operateTag.value)) {
            keyword.tags.push(operateTag.value);
          }
        } else {
          keyword.tags = keyword.tags.filter((t: string) => t !== operateTag.value);
        }
      } else {
        batchFailedIds.value.push(id);
      }
    });
  };

  return {
    keywordBatchResult,
    executeKeywordBatch,
    keywordBatchLoading,
    keywordBatchError,
    onKeywordBatch,
    onEditTag,
    operateTag,
    operateAction,
    editTagWaring,
    batchFailedIds,
  };
}
