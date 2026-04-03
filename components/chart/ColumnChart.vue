<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';
import {
  axisLabelStyle,
  axisTitleStyle,
  chartColors,
  chartLegendStyle,
  chartTitleStyle,
  tooltipTheme,
} from './chartTheme';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
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
    itemStyle: chartLegendStyle,
  },
  xAxis: {
    categories: ['USA', 'China', 'Brazil', 'EU', 'Argentina', 'India'],
    crosshair: true,
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: axisLabelStyle,
    accessibility: {
      description: 'Countries',
    },
  },
  yAxis: {
    min: 0,
    gridLineColor: chartColors.dividerSoft,
    labels: axisLabelStyle,
    title: {
      text: '1000 metric tons (MT)',
      ...axisTitleStyle,
    },
  },
  tooltip: {
    ...tooltipTheme,
    valueSuffix: ' (1000 MT)',
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      borderRadius: 4,
    },
  },
  series: [
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
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
