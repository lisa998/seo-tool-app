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

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  hoverText: {
    type: String,
    required: false,
  },
  height: {
    type: Number,
    default: 300,
  },
  data: {
    type: Array as PropType<{ name: string; data: number[] }[]>,
    default: () => [
      {
        name: 'Moose',
        data: [
          38000, 37300, 37892, 38564, 36770, 36026, 34978, 35657, 35620, 35971, 36409, 36435, 34643, 34956, 33199,
          31136, 30835, 31611, 30666, 30319, 31766, 29278, 27487, 26007,
        ],
      },
      {
        name: 'Deer',
        data: [
          22534, 23599, 24533, 25195, 25896, 27635, 29173, 32646, 35686, 37709, 39143, 36829, 35031, 36202, 35140,
          33718, 37773, 42556, 43820, 46445, 50048, 52804, 49317, 52490,
        ],
      },
    ],
  },
  xAxisCategories: {
    type: Array<String>,
    default: () => [],
  },
});

const series = computed(() => {
  const colorSet = [chartColors.primary, chartColors.accent, chartColors.text];
  console.log(props.data);
  return props.data.map(({ name, data }, i) => ({
    name,
    color: colorSet[i],
    lineColor: colorSet[i],
    fillColor: withOpacity(colorSet[i], 0.2),
    data,
  }));
});

const options = computed(() => ({
  colors: [chartColors.primary, chartColors.warning],
  chart: {
    type: 'areaspline',
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },
  legend: {
    layout: 'vertical',
    align: 'left',
    verticalAlign: 'top',
    x: 80,
    y: 20,
    floating: true,
    borderWidth: 1,
    borderColor: chartColors.divider,
    backgroundColor: withOpacity(chartColors.surfaceSoft, 0.88),
    itemStyle: chartLegendStyle,
  },
  xAxis: {
    categories: props.xAxisCategories,
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: axisLabelStyle,
  },
  yAxis: {
    gridLineColor: chartColors.dividerSoft,
    labels: axisLabelStyle,
    title: {
      text: 'Quantity',
      ...axisTitleStyle,
    },
  },
  tooltip: {
    ...tooltipTheme,
    shared: true,
    headerFormat: `<b>${props.hoverText ? `${props.hoverText} ` : ''}{point.key}</b><br>`,
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 1,
    },
  },
  series: series.value,
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
