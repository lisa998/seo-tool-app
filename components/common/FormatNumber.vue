<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { formatCompactNumber } from '~/utils/formatCompactNumber';

export default defineComponent({
  props: {
    value: {
      type: Number,
      required: true,
    },
    decimals: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const numberText = computed(() => formatCompactNumber(props.value, props.decimals));
    const textColorClass = computed(() => ({
      'text-accent': props.value < 0,
      'text-success': props.value > 0,
      'text-text-secondary': props.value === 0,
    }));

    const iconClass = computed(() => ({
      'el-icon-caret-top': props.value > 0,
      'el-icon-caret-bottom': props.value < 0,
      'el-icon-minus': props.value === 0,
    }));

    return {
      formatCompactNumber,
      textColorClass,
      iconClass,
      numberText,
    };
  },
});
</script>

<template>
  <div class="flex gap-1 items-center">
    <i :class="{ ...iconClass, ...textColorClass }"></i>
    <p v-if="numberText !== '0'" :class="textColorClass">{{ numberText }}</p>
  </div>
</template>

<style scoped></style>
