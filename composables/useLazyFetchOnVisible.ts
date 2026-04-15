import useLazyLoad from '~/composables/useLazyLoad';
import { ref, Ref, watch } from '@nuxtjs/composition-api';

export default function (targetRef: Ref<HTMLDivElement | null>, fetchFns: () => Promise<void>) {
  const { isVisible } = useLazyLoad(targetRef);
  const isPendingRefresh = ref(false);

  const markPendingRefresh = () => {
    isPendingRefresh.value = true;
  };

  const fetchIfVisible = async () => {
    // 一開始就可見
    if (isVisible.value && isPendingRefresh.value) {
      await fetchFns();
      isPendingRefresh.value = false;
    }
  };

  // 滾動後可見
  watch(isVisible, async (visible) => {
    if (visible && isPendingRefresh.value) {
      await fetchFns();
      isPendingRefresh.value = false;
    }
  });

  return { fetchIfVisible, markPendingRefresh };
}
