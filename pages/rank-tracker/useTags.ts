import { useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import type { RankTrackerTagsResponse } from '~/pages/rank-tracker/types';

export default function () {
  const { $axios } = useContext();

  const {
    loading: tagsLoading,
    error: tagsError,
    data: tags,
    execute,
  } = useRequestState<RankTrackerTagsResponse>(null);

  const fetchTags = () => execute(() => $axios.$get('/api/rank-tracker/tags'));

  return {
    tags,
    fetchTags,
    tagsLoading,
    tagsError,
  };
}
