<template></template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const count = ref(0);
    return {
      count,
    };
  },
  middleware: ['home'],
});
</script>
