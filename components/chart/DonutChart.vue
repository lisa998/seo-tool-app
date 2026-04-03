<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';
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
    valueSuffix: '%',
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      borderColor: chartColors.surfaceSoft,
      borderWidth: 3,
      dataLabels: {
        enabled: true,
        format: '{point.name}: {y} %',
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
      name: 'Percentage',
      colorByPoint: true,
      innerSize: '75%',
      data: [
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
  ],
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
