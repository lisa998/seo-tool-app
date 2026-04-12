import { Ref } from '@nuxtjs/composition-api';

export default async function (loadingRef: Ref<boolean>, asyncFunc: (...args: any[]) => Promise<void>) {
  loadingRef.value = true;
  try {
    await asyncFunc();
  } finally {
    loadingRef.value = false;
  }
}
