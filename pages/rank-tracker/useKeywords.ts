import { computed, Ref, useContext, watch } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import {
  keywordsResponseMapper,
  type RankTrackerKeywordsViewModelResponse,
} from '~/mappers/rank-tracker/keywords.mapper';
import { executeCache } from '~/utils/requestCache';
import type { RankTrackerKeywordsResponse, RankTrackerKeywordsTab } from '~/pages/rank-tracker/types';

export default function (
  activeTab: Ref<RankTrackerKeywordsTab>,
  cursor: Ref<string | null>,
  limit: Ref<number>,
  tag: Ref<string>,
  sort: Ref<string>,
) {
  const { $axios } = useContext();

  const {
    loading: keywordsLoading,
    error: keywordsError,
    data: keywords,
    execute,
  } = useRequestState<RankTrackerKeywordsViewModelResponse>(null);

  const getParams = () => {
    const result: Record<string, string | number> = {
      tab: activeTab.value,
      limit: limit.value,
      sort: sort.value,
    };
    if (cursor.value) result.cursor = cursor.value;
    if (tag.value) result.tag = tag.value;

    return result;
  };

  const fetchKeywords = () =>
    execute(async () => {
      const cacheKey = `rank-tracker-keywords-${activeTab.value}-${cursor.value ?? ''}-${limit.value}-${tag.value}-${sort.value}`;

      const response = await executeCache(cacheKey, () =>
        $axios.$get<RankTrackerKeywordsResponse>('/api/rank-tracker/keywords', {
          params: getParams(),
        }),
      ).then(keywordsResponseMapper);

      if (!cursor.value || !keywords.value) {
        return response;
      }

      return {
        ...response,
        data: [...keywords.value.data, ...response.data],
      };
    });

  const resetKeywords = async () => {
    cursor.value = null;
    keywords.value = null;
    await fetchKeywords();
  };
  // 若 activeTab、tag、sort、limit 變動，則重置關鍵字列表（回到第一頁）
  watch([activeTab, tag, sort, limit], () => resetKeywords());

  const loadMore = async () => {
    if (keywords.value?.pagination?.hasMore) {
      cursor.value = keywords.value.pagination.cursor;
      await fetchKeywords();
    }
  };

  const summaryCard = computed(() => [
    {
      title: '追蹤關鍵字',
      value: keywords?.value?.summary.total,
      icon: 'el-icon-search',
      iconColor: '#A48677',
    },
    {
      title: '排名進步',
      value: keywords?.value?.summary.improved,
      icon: 'el-icon-caret-top',
      iconColor: '#7E9D7A',
    },
    {
      title: '排名退步',
      value: keywords?.value?.summary.declined,
      icon: 'el-icon-caret-bottom',
      iconColor: '#C96455',
    },
    {
      title: '新進榜',
      value: keywords?.value?.summary.new,
      icon: 'el-icon-star-on',
      iconColor: '#D89A52',
    },
  ]);

  return {
    keywords,
    fetchKeywords,
    resetKeywords,
    keywordsLoading,
    keywordsError,
    summaryCard,
    loadMore,
  };
}
