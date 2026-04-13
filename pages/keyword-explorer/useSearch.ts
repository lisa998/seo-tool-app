import { computed, reactive, watch } from '@nuxtjs/composition-api';
import useRouteQuery from '~/composables/useRouteQuery';
import useDebouncedAbortableFetch from '~/composables/useDebouncedAbortableFetch';

interface Suggestions {
  keyword: string;
  volume: number;
  difficulty: number;
  disabled?: boolean;
}

export default function () {
  const search = reactive<Suggestions>({
    keyword: '',
    volume: 0,
    difficulty: 0,
  });

  const { defaultQuery } = useRouteQuery(search);
  if (defaultQuery?.keyword) {
    search.keyword = defaultQuery.keyword;
  }

  const fetchAutoComplete = async (query: string, signal: AbortSignal) => {
    const url = `/api/keyword/autocomplete?q=${query}`;
    const data = await fetch(url, { signal, headers: { Authorization: `Bearer token-1234567890` } });
    if (!data.ok) {
      throw new Error(`Error fetching autocomplete: ${data.statusText}`);
    }
    return await data.json();
  };

  const { data, execute } = useDebouncedAbortableFetch(fetchAutoComplete, 500);
  const suggestions = computed(() => data.value?.suggestions ?? []);

  let pendingCb: ((d: Partial<Suggestions>[]) => void) | null = null;

  watch(suggestions, (val) => {
    if (!pendingCb) return;
    pendingCb(val.length ? val : [{ keyword: '查無相關結果/請輸入兩個字以上', disabled: true }]);
    pendingCb = null;
  });

  const querySearch = (query: string, cb: (d: Partial<Suggestions>[]) => void) => {
    pendingCb = cb;
    execute(query);
  };

  const handleSelect = (item: Suggestions) => {
    if (item.disabled) return;
    Object.assign(search, item);
  };

  return { search, querySearch, handleSelect };
}
