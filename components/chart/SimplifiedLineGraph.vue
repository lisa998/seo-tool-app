<template>
  <highcharts ref="highchartsRef" :options="options"/>
</template>
<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

const chartOptions = {
  xAxis: {
    visible: false
  },
  yAxis: {
    visible: false
  },
  tooltip: {
    enabled: false
  },
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: false
  }
}
const lineShadow = {
  color: 'rgba(0,0,0,0.3)',
  offsetX: 3,
  offsetY: 3,
  opacity: 0.4,
  width: 4
}
const marker = {
  enabled: false,
  states: {
    hover: {
      enabled: false
    }
  }
}
export default defineComponent({
  props: {
    lineColor: {
      type: String,
      default: '#6F5C54'
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
        [80, -76.5]
      ]
    },
    height: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 100
    }
  },
  computed: {
    options() {
      return {
        ...chartOptions,
        chart: {
          type: 'spline',
          height: this.height,
          width: this.width,
          backgroundColor: 'transparent',
          margin: [0, 0, 0, 0]
        },

        series: [
          {
            type: 'line',
            data: this.data,
            color: this.lineColor,
            shadow: lineShadow,
            marker
          }
        ]
      }
    }
  }
})


</script>
