<script lang="ts" setup>
import { computed, ref } from '@nuxtjs/composition-api';

const props = defineProps({
  height: {
    type: Number,
    default: 500,
  },
  rowHeight: {
    type: Number,
    default: 50,
  },
  bufferSize: {
    type: Number,
    default: 5,
  },
  itemsLength: {
    type: Number,
    required: true,
  },
});

const scroll = (e: Event) => {
  currentScrollTop.value = (e.target as HTMLDivElement).scrollTop;
};
const totalHeight = computed(() => props.itemsLength * props.rowHeight);
const currentScrollTop = ref(0);
const startIndex = computed(() => Math.max(Math.floor(currentScrollTop.value / props.rowHeight) - props.bufferSize, 0));
const endIndex = computed(() =>
  Math.min(startIndex.value + Math.ceil(props.height / props.rowHeight) + props.bufferSize, props.itemsLength),
);
</script>

<template>
  <div :style="{ height: props.height + 'px' }" class="overflow-y-scroll w-full relative" @scroll="scroll">
    <div :style="{ height: totalHeight + 'px' }" class="w-full absolute"></div>
    <div :style="{ top: startIndex * rowHeight + 'px' }" class="absolute w-full left-0 right-0">
      <slot :endIndex="endIndex" :startIndex="startIndex"></slot>
    </div>
  </div>
</template>

<style scoped></style>
