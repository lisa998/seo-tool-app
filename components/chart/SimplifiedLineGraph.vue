<template>
  <highcharts ref="highchartsRef" :options="options" />
</template>
<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api';

const chartOptions = {
  xAxis: {
    visible: false,
  },
  yAxis: {
    visible: false,
  },
  tooltip: {
    headerFormat: '',
    pointFormat: '{series.name}: <b>{point.y}</b>',
  },
  title: {
    text: null,
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
};
const props = defineProps({
  lineColor: {
    type: String,
    default: '#6F5C54',
  },
  data: {
    type: Array,
    default: () => [
      [0, 15],
      [10, 100],
      [20, -56.5],
      [30, -46.5],
      [40, -22.1],
      [50, -2.5],
      [60, -27.7],
      [70, -55.7],
      [80, -76.5],
    ],
  },
  height: {
    type: Number,
    default: 100,
  },
  width: {
    type: Number,
    default: 100,
  },
  title: {
    type: String,
    default: '',
  },
});

const lineShadow = {
  color: 'rgba(0,0,0,0.3)',
  offsetX: 3,
  offsetY: 3,
  opacity: 0.4,
  width: 4,
};
const marker = {
  enabled: false,
  states: {
    hover: {
      enabled: false,
    },
  },
};

const options = computed(() => {
  return {
    ...chartOptions,
    chart: {
      type: 'spline',
      height: props.height,
      width: props.width,
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0],
    },

    series: [
      {
        type: 'line',
        name: props.title,
        data: props.data,
        color: props.lineColor,
        shadow: lineShadow,
        marker,
      },
    ],
  };
});
</script>
