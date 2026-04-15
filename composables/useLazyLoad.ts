import { onBeforeUnmount, onMounted, Ref, ref } from '@nuxtjs/composition-api';

export default function (
  containerRef: Ref<HTMLDivElement | null>,
  options: IntersectionObserverInit = { rootMargin: '100px' },
) {
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!containerRef?.value) return;
    observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting;
    }, options);

    observer.observe(containerRef.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { isVisible };
}
