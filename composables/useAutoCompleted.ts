import { ref } from '@nuxtjs/composition-api';
import debounce from '~/utils/debounce';
import abortController from '~/composables/useAbortController';

let controller: AbortController | null = null;

export default async function useAutoCompleted<T extends Record<string, any>>(url: string) {
  const data = ref<Record<string, any> | null>(null);
  if (controller) {
    controller.abort();
  }
  const fetchFn = debounce(() => abortController(url, data), 500);
  await fetchFn();
  return { data };
}
