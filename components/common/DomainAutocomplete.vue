<template>
  <el-autocomplete
    :fetch-suggestions="fetchSuggestions"
    :placeholder="props.placeholder"
    :trigger-on-focus="props.triggerOnFocus"
    :value="props.value"
    class="w-full"
    @input="handleInput"
    @select="handleInput"
  >
    <template v-slot="{ item }">
      <p>{{ item }}</p>
    </template>
  </el-autocomplete>
</template>

<script lang="ts" setup>
import { exampleDomain } from '~/constants/exampleDomain';

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '輸入目標網址 (domain / URL / prefix)',
  },
  triggerOnFocus: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['input']);

const fetchSuggestions = (_query: string, cb: (d: string[]) => void) => {
  cb(exampleDomain);
};

const handleInput = (value: string) => {
  emit('input', value);
};
</script>
