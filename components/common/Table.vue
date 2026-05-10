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
    minWidth: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: 'md',
    },
    stickyHeader: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const gridStyle = computed(() => props.gridTemplate || 'grid-flow-col auto-cols-fr');
    const sizeClass = computed(() => {
      switch (props.size) {
        case 'xs':
          return { tr: 'text-xs gap-1', td: 'px-2 py-1' };
        default:
          return { tr: 'gap-4', td: 'px-4 py-2' };
      }
    });

    return {
      gridStyle,
      sizeClass,
    };
  },
});
</script>

<template>
  <table :style="minWidth ? { minWidth } : undefined" class="w-full border-collapse border-spacing-0 relative">
    <thead :class="stickyHeader ? 'sticky' : ''" class="text-text-secondary border-bottom bg-divider-soft top-0 z-10">
      <tr :class="['grid', gridStyle, sizeClass.tr, 'text-start']">
        <th v-for="col in columnConfig" :key="col.key" :class="sizeClass.td">{{ col.title }}</th>
      </tr>
    </thead>
    <tbody class="bg-surface-soft">
      <tr
        v-for="(item, i) in data"
        :key="item.id ?? i"
        :class="['grid', gridStyle, sizeClass.tr, 'text-start', 'border-bottom']"
      >
        <td v-for="col in columnConfig" :key="col.key" :class="sizeClass.td" class="overflow-hidden">
          <slot v-if="col.slot" :name="col.key" :row="item" />
          <div v-else class="truncate">{{ item[col.key] }}</div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ab9b93;

  &:last-child {
    border-bottom: none;
  }
}
</style>
