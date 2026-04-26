import { ref, Ref } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

export default function <T>(initialData: T | null = null) {
  const loading = ref(false);
  const error = ref<unknown | null>(null);
  const data = ref<T | null>(initialData) as Ref<T | null>;

  const execute = (fetchFn: () => Promise<T>) =>
    withLoading(
      loading,
      async () => {
        data.value = await fetchFn();
      },
      error,
    );

  return {
    loading,
    error,
    data,
    execute,
  };
}
