import { Ref } from '@nuxtjs/composition-api';

let controller: AbortController | null = null;
export default async function (url: string, data: Ref<Record<string, any> | null>) {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  try {
    const resp = await fetch(url, { signal: controller.signal, headers: { Authorization: `Bearer token-1234567890` } });
    data.value = await resp.json();
  } catch (error) {
    throw error;
  }
}
