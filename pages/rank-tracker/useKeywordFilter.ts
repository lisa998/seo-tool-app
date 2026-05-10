import { ref, watch } from '@nuxtjs/composition-api';

export default function useKeywordFilter() {
  const searchKeyword = ref('');
  const activeSearch = ref('');
  const activeTag = ref('');
  const sort = ref('position_asc');
  const limit = ref(50);

  let timer: ReturnType<typeof setTimeout> | null = null;
  watch(searchKeyword, (val) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => (activeSearch.value = val), 300);
  });

  return { searchKeyword, activeSearch, activeTag, sort, limit };
}
