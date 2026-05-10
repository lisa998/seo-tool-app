<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  gridCols: {
    type: String,
    required: true,
  },
  rowCount: {
    type: Number,
    default: 10,
  },
});

const colCount = computed(() => props.gridCols.match(/\d+fr/g)?.length || 0);
</script>

<template>
  <common-card>
    <el-skeleton animated class="mt-4">
      <template #template>
        <div v-for="row in rowCount" :key="row" :class="gridCols" class="grid gap-2 mb-4 px-2">
          <el-skeleton-item v-for="i in colCount" :key="'cell-' + row + '-' + i" variant="text" />
        </div>
      </template>
    </el-skeleton>
  </common-card>
</template>

<style scoped></style>
