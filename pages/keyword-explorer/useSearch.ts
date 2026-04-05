import { ref } from '@nuxtjs/composition-api';
import useAutoCompleted from '~/composables/useAutoCompleted';

interface Suggestions {
  keyword: string;
  volume: number;
  difficulty: number;
  disabled?: boolean;
}

export default function () {
  const search = ref<Suggestions>({
    keyword: '',
    volume: 0,
    difficulty: 0,
  });

  const querySearch = async (query: string, cb: (d: Partial<Suggestions>[]) => null) => {
    const url = `/api/keyword/autocomplete?q=${query}`;
    const { data } = await useAutoCompleted(url);
    const suggestions = data.value?.suggestions ?? [];
    cb(suggestions.length ? suggestions : [{ keyword: '查無相關結果/請輸入兩個字以上', disabled: true }]);
  };

  const handleSelect = (item: Suggestions) => {
    if (item.disabled) return;
    search.value = item;
  };

  return { search, querySearch, handleSelect };
}
