<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api';

type RowData = Record<string, any>;

interface ColumnConfigItem {
  title: string;
  key: keyof RowData;
  slot: boolean;
}

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<RowData[]>,
      required: true,
    },
    columnConfig: {
      type: Array as PropType<ColumnConfigItem[]>,
      required: true,
    },
    gridTemplate: {
      type: String,
    },
  },
  setup(props) {
    const gridStyle = computed(() => props.gridTemplate || 'grid-flow-col auto-cols-fr');
    return {
      gridStyle,
    };
  },
});
</script>

<template>
  <div class="overflow-hidden rounded-lg table-border">
    <table class="w-full border-collapse border-spacing-0">
      <thead class="text-text-secondary border-bottom bg-divider-soft">
        <tr :class="['grid', gridStyle, 'gap-4', 'text-start']">
          <th v-for="col in columnConfig" :key="col.key" class="px-4 py-2">{{ col.title }}</th>
        </tr>
      </thead>
      <tbody class="bg-surface-soft">
        <tr v-for="(item, i) in data" :key="i" :class="['grid', gridStyle, 'gap-4', 'text-start', 'border-bottom']">
          <td v-for="col in columnConfig" :key="col.key" class="px-4 py-2">
            <slot v-if="col.slot" :name="col.key" :row="item" />
            <span v-else>{{ item[col.key] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ab9b93;

  &:last-child {
    border-bottom: none;
  }
}

.table-border {
  border: 1px solid #ab9b93;
}
</style>
