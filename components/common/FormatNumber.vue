<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';

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
    const formatCompactNumber = () => {
      return new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: props.decimals,
      }).format(props.value);
    };
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
    };
  },
});
</script>

<template>
  <div class="flex gap-1 items-center">
    <i :class="{ ...iconClass, ...textColorClass }"></i>
    <p v-if="formatCompactNumber() !== '0'" :class="textColorClass">{{ formatCompactNumber() }}</p>
  </div>
</template>

<style scoped></style>
