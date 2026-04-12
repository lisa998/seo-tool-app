<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';

const props = defineProps({
  href: {
    type: String,
    required: true,
  },
  external: {
    type: Boolean,
    default: true,
  },
});

const url = computed(() => {
  if (props.external && !/^https?:\/\//.test(props.href)) {
    return `https://${props.href}`;
  }
  return props.href;
});
</script>

<template>
  <component
    :is="external ? 'a' : 'NuxtLink'"
    :class="{ 'text-primary-active hover:underline': external }"
    :href="url"
    v-bind="external ? { target: '_blank' } : {}"
  >
    <slot />
  </component>
</template>

<style scoped></style>
