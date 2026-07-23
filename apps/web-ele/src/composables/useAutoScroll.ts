import { nextTick, ref, watch } from 'vue';

export function useAutoScroll(dependency: () => any) {
  const containerRef = ref<HTMLElement | null>(null);
  const shouldAutoScroll = ref(true);

  function scrollToBottom() {
    if (!containerRef.value || !shouldAutoScroll.value) return;
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
      }
    });
  }

  function handleScroll() {
    if (!containerRef.value) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value;
    // 当距离底部 100px 以内时，认为是自动滚动区域
    shouldAutoScroll.value = scrollHeight - scrollTop - clientHeight < 100;
  }

  watch(
    dependency,
    () => {
      scrollToBottom();
    },
    { deep: true },
  );

  return {
    containerRef,
    shouldAutoScroll,
    scrollToBottom,
    handleScroll,
  };
}
