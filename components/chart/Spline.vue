<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import {
  axisLabelStyle,
  axisTitleStyle,
  chartColors,
  chartLegendStyle,
  chartTitleStyle,
  tooltipTheme,
  withOpacity,
} from './chartTheme';

interface SplineSeries {
  name: string;
  data: Array<number | [number, number]>;
  color?: string;
  yAxis?: number;
}

interface SplineYAxis {
  title?: string;
  opposite?: boolean;
  lineColor?: string;
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
  data: {
    type: Array as PropType<SplineSeries[]>,
    default: () => [
      {
        name: 'new',
        data: [
          [0, 15],
          [10, -50],
          [20, -56.5],
          [30, -46.5],
          [40, -22.1],
          [50, -2.5],
          [60, -27.7],
          [70, -55.7],
          [80, -76.5],
        ],
      },
      {
        name: 'lost',
        data: [
          [0, 15],
          [10, 50],
          [20, 56.5],
          [30, 46.5],
          [40, 22.1],
          [50, 2.5],
          [60, 27.7],
          [70, -55.7],
          [80, 76.5],
        ],
      },
    ],
  },
  xAxisCategories: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  xAxisTitle: {
    type: String,
    default: '',
  },
  yAxisTitle: {
    type: String,
    default: 'Referring domains',
  },
  yAxes: {
    type: Array as PropType<SplineYAxis[]>,
    default: () => [],
  },
});

const series = computed(() => {
  const colorSet = [
    chartColors.primaryActive,
    chartColors.success,
    chartColors.danger,
    chartColors.accent,
    chartColors.primary,
  ];

  return props.data.map(({ name, data, color, yAxis }, i) => ({
    name,
    color: color ?? colorSet[i % colorSet.length],
    data,
    yAxis: yAxis ?? 0,
  }));
});

const yAxisOptions = computed(() => {
  const axes = props.yAxes.length ? props.yAxes : [{ title: props.yAxisTitle }];

  return axes.map((axis, index) => ({
    gridLineColor: index === 0 ? chartColors.dividerSoft : 'transparent',
    title: {
      text: axis.title || null,
      ...axisTitleStyle,
    },
    labels: axisLabelStyle,
    lineWidth: 2,
    lineColor: axis.lineColor ?? (axis.opposite ? chartColors.danger : chartColors.primaryHover),
    opposite: axis.opposite ?? false,
  }));
});

const options = computed(() => ({
  chart: {
    type: 'spline',
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },

  xAxis: {
    ...(props.xAxisCategories.length ? { categories: props.xAxisCategories } : {}),
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    title: {
      text: props.xAxisTitle || null,
      ...axisTitleStyle,
    },
    labels: axisLabelStyle,
  },
  yAxis: yAxisOptions.value,
  legend: {
    enabled: props.data.length > 1,
    align: 'left',
    verticalAlign: 'top',
    itemStyle: chartLegendStyle,
    backgroundColor: withOpacity(chartColors.surfaceSoft, 0.88),
  },
  tooltip: {
    ...tooltipTheme,
    shared: true,
    headerFormat: '<b>{point.key}</b><br/>',
    pointFormat: '{series.name}: {point.y}<br/>',
  },
  plotOptions: {
    spline: {
      lineWidth: 3,
      marker: {
        enabled: false,
      },
    },
  },
  series: series.value,
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
