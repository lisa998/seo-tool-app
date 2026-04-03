<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';
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
    x: 120,
    y: 70,
    floating: true,
    borderWidth: 1,
    borderColor: chartColors.divider,
    backgroundColor: withOpacity(chartColors.surfaceSoft, 0.88),
    itemStyle: chartLegendStyle,
  },
  xAxis: {
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: axisLabelStyle,
    plotBands: [
      {
        from: 2020,
        to: 2023,
        color: withOpacity(chartColors.primary, 0.14),
      },
    ],
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
    headerFormat: `<b>${props.hoverText ? `${props.hoverText} ` : ''}{point.x}</b><br>`,
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    series: {
      pointStart: 2000,
    },
    areaspline: {
      fillOpacity: 1,
    },
  },
  series: [
    {
      name: 'Moose',
      color: chartColors.primary,
      lineColor: chartColors.primary,
      fillColor: withOpacity(chartColors.primary, 0.24),
      data: [
        38000, 37300, 37892, 38564, 36770, 36026, 34978, 35657, 35620, 35971, 36409, 36435, 34643, 34956, 33199, 31136,
        30835, 31611, 30666, 30319, 31766, 29278, 27487, 26007,
      ],
    },
    {
      name: 'Deer',
      color: chartColors.accent,
      lineColor: chartColors.accent,
      fillColor: withOpacity(chartColors.accent, 0.18),
      data: [
        22534, 23599, 24533, 25195, 25896, 27635, 29173, 32646, 35686, 37709, 39143, 36829, 35031, 36202, 35140, 33718,
        37773, 42556, 43820, 46445, 50048, 52804, 49317, 52490,
      ],
    },
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
