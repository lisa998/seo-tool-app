import type { Ref } from '@nuxtjs/composition-api';
import { ref } from '@nuxtjs/composition-api';

type RequestFn<T> = (query: string, signal: AbortSignal) => Promise<T>;

export default function <T>(fn: RequestFn<T>, delay: number) {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref<boolean>(false);
  const error = ref<unknown | null>(null);

  let timer: NodeJS.Timeout | null = null;
  let controller: AbortController | null = null;
  let requestId = 0;

  const execute = async (query: string) => {
    if (controller) controller.abort();
    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      loading.value = true;
      error.value = null;

      controller = new AbortController();
      requestId++;
      const currentRequestId = requestId;

      try {
        const result = await fn(query, controller.signal);
        if (currentRequestId !== requestId) return;
        data.value = result;
      } catch (e) {
        error.value = e;
      } finally {
        if (currentRequestId === requestId) loading.value = false;
      }
    }, delay);
  };

  const cancel = () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    loading.value = false;
  };

  return { data, loading, error, execute, cancel };
}
