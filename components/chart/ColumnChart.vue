<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import {
  axisLabelStyle,
  axisTitleStyle,
  chartColors,
  chartLegendStyle,
  chartTitleStyle,
  tooltipTheme,
} from './chartTheme';
import { formatCompactNumber } from '~/utils/formatCompactNumber';

interface ColumnSeries {
  name: string;
  data: number[];
  color?: string;
}

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
  categories: {
    type: Array as PropType<string[]>,
    default: () => ['USA', 'China', 'Brazil', 'EU', 'Argentina', 'India'],
  },
  series: {
    type: Array as PropType<ColumnSeries[]>,
    default: () => [
      {
        name: 'Corn',
        color: chartColors.primary,
        data: [387749, 280000, 129000, 64300, 54000, 34300],
      },
      {
        name: 'Wheat',
        color: chartColors.accent,
        data: [45321, 140000, 10000, 140500, 19500, 113500],
      },
    ],
  },
  yAxisTitle: {
    type: String,
    default: '',
  },
  compactValues: {
    type: Boolean,
    default: true,
  },
});

const formatValue = (value: number) => (props.compactValues ? formatCompactNumber(value, 1) : `${value}`);
const normalizedSeries = computed(() => {
  const colorSet = [chartColors.primary, chartColors.accent, chartColors.success, chartColors.danger];

  return props.series.map((series, index) => ({
    ...series,
    color: series.color ?? colorSet[index % colorSet.length],
  }));
});

const options = computed(() => ({
  chart: {
    type: 'column',
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },
  legend: {
    enabled: props.series.length > 1,
    itemStyle: chartLegendStyle,
  },
  xAxis: {
    categories: props.categories,
    crosshair: true,
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: {
      ...axisLabelStyle,
      rotation: props.categories.length > 8 ? -35 : 0,
    },
    accessibility: {
      description: 'Countries',
    },
  },
  yAxis: {
    min: 0,
    gridLineColor: chartColors.dividerSoft,
    labels: {
      ...axisLabelStyle,
      formatter(this: { value: number }) {
        return formatValue(this.value);
      },
    },
    title: {
      text: props.yAxisTitle || null,
      ...axisTitleStyle,
    },
  },
  tooltip: {
    ...tooltipTheme,
    shared: true,
    pointFormatter(this: { color: string; series: { name: string }; y: number }) {
      return `<span style="color:${this.color}">\u25cf</span> ${this.series.name}: <b>${formatValue(this.y)}</b><br/>`;
    },
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      borderRadius: 4,
    },
  },
  series: normalizedSeries.value,
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
