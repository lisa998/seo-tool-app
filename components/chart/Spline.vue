<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';
import { axisLabelStyle, axisTitleStyle, chartColors, chartTitleStyle, tooltipTheme } from './chartTheme';

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
    type: 'spline',
    inverted: true,
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },

  xAxis: {
    reversed: false,
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    title: {
      enabled: true,
      text: 'xAxis',
      ...axisTitleStyle,
    },
    labels: {
      format: '{value} km',
      ...axisLabelStyle,
    },
    accessibility: {
      rangeDescription: 'Range: 0 to 80 km.',
    },
    maxPadding: 0.05,
    showLastLabel: true,
  },
  yAxis: {
    gridLineColor: chartColors.dividerSoft,
    title: {
      text: 'Temperature',
      ...axisTitleStyle,
    },
    labels: {
      format: '{value}°',
      ...axisLabelStyle,
    },
    accessibility: {
      rangeDescription: 'Range: -90°C to 20°C.',
    },
    lineWidth: 2,
    lineColor: chartColors.primaryHover,
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    ...tooltipTheme,
    headerFormat: '<b>{series.name}</b><br/>',
    pointFormat: '{point.x} km: {point.y}°C',
  },
  plotOptions: {
    spline: {
      lineWidth: 3,
      marker: {
        enabled: false,
      },
    },
  },
  series: [
    {
      name: 'Temperature',
      color: chartColors.primaryActive,
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
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
