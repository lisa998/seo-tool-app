import { Ref, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import type {
  RankTrackerKeywordBatchAction,
  RankTrackerKeywordBatchPayload,
  RankTrackerKeywordBatchResponse,
  TagActionType,
} from '~/pages/rank-tracker/types';
import {
  RankTrackerKeywordsViewModelResponse,
  RankTrackerKeywordViewModel,
} from '~/mappers/rank-tracker/keywords.mapper';
import { Notification } from 'element-ui';

const MaxRetryCount = 3;
const errorTitleMap: Record<RankTrackerKeywordBatchAction, string> = {
  addTag: '新增標籤失敗',
  removeTag: '移除標籤失敗',
  delete: '刪除關鍵字失敗',
  refreshRank: '更新排名失敗',
};
const errorMessage = (willRetryOnError: boolean) => (willRetryOnError ? '自動重試中...' : '重試超過三次，請稍後再試');

export default function (selectKeywordIds: Ref<string[]>, keywords: Ref<RankTrackerKeywordsViewModelResponse | null>) {
  const { $axios } = useContext();

  const {
    loading: keywordBatchLoading,
    error: keywordBatchError,
    data: keywordBatchResult,
    execute,
  } = useRequestState<RankTrackerKeywordBatchResponse>(null);

  const executeKeywordBatch = (payload: RankTrackerKeywordBatchPayload, willRetryOnError: boolean = false) =>
    execute(() =>
      $axios.$post('/api/rank-tracker/keywords/batch', payload, {
        errorTitle: errorTitleMap[payload.action],
        errorMessage: errorMessage(willRetryOnError),
      }),
    );

  const onKeywordBatch = async (action: 'delete' | 'refreshRank') => {
    if (!selectKeywordIds.value.length) return;

    await executeKeywordBatch({ action, keywordIds: selectKeywordIds.value });

    if (action === 'refreshRank') {
      keywordBatchResult.value?.results.forEach(({ id, success, kw }) => {
        if (!success || !kw) return;
        const keyword = keywords.value?.data?.find((k) => k.id === id);
        if (keyword) keyword.current = kw.position.current;
      });
    } else if (action === 'delete') {
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
  const editTagWarning = ref(false);
  const batchFailedIds = ref<string[]>([]);
  const operateTag = ref('');
  let startEditTag = false;

  const onEditTag = async () => {
    if (keywordBatchLoading.value || startEditTag) return;
    const tag = operateTag.value.trim();
    const action = operateAction.value;
    const keywordIds = [...selectKeywordIds.value];

    if (!tag || !keywordIds.length) {
      editTagWarning.value = true;
      return;
    }

    startEditTag = true;
    editTagWarning.value = false;
    batchFailedIds.value = [];

    const prevState = structuredClone(keywords.value?.data || []);

    optimisticUpdate(tag, action, keywordIds);
    try {
      const isSuccess = await onEditTagRequest({ action, keywordIds, payload: { tag } }, prevState);
      if (!isSuccess && keywords.value) {
        keywords.value = { ...keywords.value, data: prevState };
      }
    } finally {
      startEditTag = false;
    }
  };

  const onEditTagRequest = async (
    payload: RankTrackerKeywordBatchPayload,
    prevState: RankTrackerKeywordViewModel[],
    retryCount = 0,
  ): Promise<boolean> => {
    await executeKeywordBatch(payload, retryCount < MaxRetryCount);

    if (keywordBatchError.value) {
      if (retryCount < MaxRetryCount) {
        return onEditTagRequest(payload, prevState, retryCount + 1);
      }
      return false;
    }

    keywordBatchResult.value?.results.forEach(({ id, success }) => {
      if (!success) batchFailedIds.value.push(id);
    });

    rollbackFailedItems(prevState);

    if (retryCount) {
      Notification.success({
        type: 'success',
        title: '操作成功',
        message: `第 ${retryCount} 次重試成功`,
      });
    }

    // msw 實際不會操作後端資料，暫不更新
    // await fetchKeywords();
    return true;
  };

  const rollbackFailedItems = (prevState: RankTrackerKeywordViewModel[]) => {
    if (batchFailedIds.value.length && keywords.value) {
      const batchFailedIdsSet = new Set(batchFailedIds.value);
      const prevStateMap = new Map(prevState.map((k) => [k.id, k]));
      // rollback
      const newData = keywords.value.data.map((item) =>
        batchFailedIdsSet.has(item.id) ? prevStateMap.get(item.id) || item : item,
      );
      keywords.value = { ...keywords.value, data: newData };
    }
  };

  const optimisticUpdate = (tag: string, action: TagActionType, keywordIds: string[]) => {
    keywordIds.forEach((id) => {
      const keyword = keywords.value?.data?.find((k) => k.id === id);
      if (!keyword) return;
      if (action === 'addTag') {
        if (!keyword.tags.includes(tag)) {
          keyword.tags.push(tag);
        }
      } else {
        keyword.tags = keyword.tags.filter((t: string) => t !== tag);
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
    editTagWarning,
    batchFailedIds,
  };
}
