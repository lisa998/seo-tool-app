<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
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
  categories: {
    type: Array as PropType<string[]>,
    default: () => [
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
  },
  data: {
    type: Array as PropType<Number[]>,
    default: () => [24.1, 20.6, 20.3, 15.2, 14.8, 14.5, 13.1, 10.0, 9.9, 9.8],
  },
  seriesName: {
    type: String,
    default: '',
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
    categories: props.categories,
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
    gridLineColor: chartColors.dividerSoft,
    title: {
      text: null,
    },
    labels: {
      overflow: 'justify',
      ...axisLabelStyle,
    },
  },
  plotOptions: {
    bar: {
      borderWidth: 1,
      borderRadius: 4,
      dataLabels: {
        enabled: true,
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
    stickOnContact: true,
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      name: props.seriesName,
      color: barSeriesTheme.value.color,
      borderColor: barSeriesTheme.value.borderColor,
      data: props.data,
    },
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
