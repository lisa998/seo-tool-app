import { Ref } from '@nuxtjs/composition-api';

export default async function (
  loadingRef: Ref<boolean>,
  asyncFunc: (...args: any[]) => Promise<void>,
  errorRef?: Ref<unknown>,
) {
  loadingRef.value = true;
  if (errorRef) errorRef.value = null;
  try {
    await asyncFunc();
  } catch (err) {
    if (errorRef) errorRef.value = err;
  } finally {
    loadingRef.value = false;
  }
}