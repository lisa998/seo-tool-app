import { reactive } from '@nuxtjs/composition-api';
import useAutoCompleted from '~/composables/useAutoCompleted';
import useRouteQuery from '~/composables/useRouteQuery';

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

  const querySearch = async (query: string, cb: (d: Partial<Suggestions>[]) => null) => {
    const url = `/api/keyword/autocomplete?q=${query}`;
    const { data } = await useAutoCompleted(url);
    const suggestions = data.value?.suggestions ?? [];
    cb(suggestions.length ? suggestions : [{ keyword: '查無相關結果/請輸入兩個字以上', disabled: true }]);
  };

  const handleSelect = (item: Suggestions) => {
    if (item.disabled) return;
    Object.assign(search, item);
  };

  return { search, querySearch, handleSelect };
}
