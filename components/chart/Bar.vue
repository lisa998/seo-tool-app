<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';
import { axisLabelStyle, chartColors, chartTitleStyle, getBarSeriesTheme, tooltipTheme } from './chartTheme';

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

const barSeriesTheme = computed(() => getBarSeriesTheme(props.title));

const options = computed(() => ({
  chart: {
    type: 'bar',
    zooming: {
      type: 'y',
    },
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },
  xAxis: {
    categories: [
      'Austria',
      'Estonia',
      'Sweden',
      'Italy',
      'Czechia',
      'Latvia',
      'Finland',
      'Slovenia',
      'Slovakia',
      'Denmark',
    ],
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: axisLabelStyle,
    title: {
      text: null,
    },
    accessibility: {
      description: 'Countries',
    },
  },
  yAxis: {
    min: 0,
    max: 30,
    tickInterval: 10,
    gridLineColor: chartColors.dividerSoft,
    title: {
      text: null,
    },
    accessibility: {
      description: 'Organic farming area',
      rangeDescription: 'Range: 0 to 30%.',
    },
    labels: {
      overflow: 'justify',
      format: '{value}%',
      ...axisLabelStyle,
    },
  },
  plotOptions: {
    bar: {
      borderWidth: 1,
      borderRadius: 4,
      dataLabels: {
        enabled: true,
        format: '{y}%',
        style: {
          color: chartColors.text,
          fontWeight: '600',
          textOutline: 'none',
        },
      },
    },
  },
  tooltip: {
    ...tooltipTheme,
    valueSuffix: '%',
    stickOnContact: true,
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      name: 'Organic farming area',
      color: barSeriesTheme.value.color,
      borderColor: barSeriesTheme.value.borderColor,
      data: [24.1, 20.6, 20.3, 15.2, 14.8, 14.5, 13.1, 10.0, 9.9, 9.8],
    },
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
