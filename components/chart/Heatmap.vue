<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import { chartTitleStyle } from '~/components/chart/chartTheme';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    default: 400,
  },
  data: {
    type: Array as PropType<Array<Array<number>>>,
    default: () => [
      // [x, y, value]  x=月份index, y=feature index, value=0或1
      [0, 0, 1],
      [0, 1, 1],
      [0, 2, 0],
      [0, 3, 1],
      [0, 4, 0],
      [1, 0, 1],
      [1, 1, 1],
      [1, 2, 1],
      [1, 3, 1],
      [1, 4, 0],
      [2, 0, 1],
      [2, 1, 1],
      [2, 2, 1],
      [2, 3, 0],
      [2, 4, 1],
      // ...
    ],
  },
  xAxisCategories: {
    type: Array as PropType<Array<string>>,
    default: () => ['2024-01', '2024-02', '2024-03' /* ... */],
  },
  yAxisCategories: {
    type: Array as PropType<Array<string>>,
    default: () => ['Featured Snippet', 'People Also Ask', 'Image Pack', 'Video', 'Knowledge Panel'],
  },
  yAxisTitle: {
    type: String,
    default: '',
  },
});

const options = computed(() => ({
  chart: { type: 'heatmap', height: props.height },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },
  xAxis: {
    categories: props.xAxisCategories,
    labels: { style: { fontSize: '10px' } },
  },
  yAxis: {
    categories: props.yAxisCategories,
    reversed: true,
    title: props.yAxisTitle,
  },
  legend: {
    align: 'left',
    verticalAlign: 'bottom',
    layout: 'horizontal',
    floating: true,
    y: 15,
    symbolWidth: 50,
  },
  colorAxis: {
    min: 0,
    max: 1,
    tickInterval: 1,
    labels: {
      formatter(this: { value: number }): string {
        return this.value === 0 ? '無' : '有';
      },
    },
    stops: [
      [0, '#F3E8E2'], // 無
      [1, '#A48677'], // 有
    ],
  },
  series: [
    {
      name: 'SERP Features',
      borderWidth: 2,
      borderColor: '#0f172a',
      data: props.data,
      dataLabels: { enabled: false },
    },
  ],
  tooltip: {
    formatter(this: { series: Record<string, any>; point: Record<string, any> }) {
      const feature = this.series.yAxis.categories[this.point.y];
      const month = this.series.xAxis.categories[this.point.x];
      return `<b>${feature}</b><br/>${month}: ${this.point.value ? '出現' : '未出現'}`;
    },
  },
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
