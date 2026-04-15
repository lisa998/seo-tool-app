<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import { chartColors, chartLegendStyle, chartPalette, chartTitleStyle, tooltipTheme } from './chartTheme';

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
    type: Array as PropType<Array<{ name: string; y: number }>>,
    default: () => [
      {
        name: 'Nitrogen',
        y: 78,
      },
      {
        name: 'Oxygen',
        y: 20.9,
      },
      {
        name: 'Other gases',
        y: 1.1,
      },
    ],
  },
  seriesName: {
    type: String,
    default: 'Percentage',
  },
  valueSuffix: {
    type: String,
    default: '%',
  },
});

const options = computed(() => ({
  colors: chartPalette,
  chart: {
    type: 'pie',
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
  tooltip: {
    ...tooltipTheme,
    pointFormat: `<span style="color:{point.color}">\u25cf</span> {point.name}: <b>{point.y}${props.valueSuffix}</b><br/>`,
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      borderColor: chartColors.surfaceSoft,
      borderWidth: 3,
      dataLabels: {
        enabled: true,
        format: `{point.name}: {y}${props.valueSuffix}`,
        style: {
          color: chartColors.text,
          fontWeight: '500',
          textOutline: 'none',
        },
      },
      showInLegend: true,
    },
  },
  series: [
    {
      name: props.seriesName,
      colorByPoint: true,
      innerSize: '75%',
      data: props.data,
    },
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
