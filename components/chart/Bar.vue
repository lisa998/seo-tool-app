<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import { axisLabelStyle, chartColors, chartTitleStyle, getBarSeriesTheme, tooltipTheme } from './chartTheme';
import { formatCompactNumber } from '~/utils/formatCompactNumber';

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
    type: Array as PropType<number[]>,
    default: () => [24.1, 20.6, 20.3, 15.2, 14.8, 14.5, 13.1, 10.0, 9.9, 9.8],
  },
  seriesName: {
    type: String,
    default: '',
  },
  compactValues: {
    type: Boolean,
    default: true,
  },
});

const barSeriesTheme = computed(() => getBarSeriesTheme(props.title));
const formatValue = (value: number) => (props.compactValues ? formatCompactNumber(value, 1) : `${value}`);

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
      formatter(this: { value: number }) {
        return formatValue(this.value);
      },
    },
  },
  plotOptions: {
    bar: {
      borderWidth: 1,
      borderRadius: 4,
      dataLabels: {
        enabled: true,
        formatter(this: { y: number }): string {
          return formatValue(this.y);
        },
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
    pointFormatter(this: { category: string; color: string; series: { name: string }; y: number }) {
      return `<span style="color:${this.color}">\u25cf</span> ${this.series.name || this.category}: <b>${formatValue(this.y)}</b><br/>`;
    },
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
