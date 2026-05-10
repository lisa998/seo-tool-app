<script lang="ts" setup>
import { computed, PropType } from '@nuxtjs/composition-api';
import {
  axisLabelStyle,
  axisTitleStyle,
  chartColors,
  chartLegendStyle,
  chartPalette,
  chartTitleStyle,
  tooltipTheme,
  withOpacity,
} from './chartTheme';

interface StackedAreaSeries {
  name: string;
  data: number[];
  color?: string;
}

const props = defineProps({
  title: {
    type: String,
    default: 'Greenhouse gases from Norwegian economic activity',
  },
  subtitle: {
    type: String,
    default: 'Source: <a href="https://www.ssb.no/en/statbank/table/09288/" target="_blank">SSB</a>',
  },
  height: {
    type: Number,
    default: 320,
  },
  yAxisTitle: {
    type: String,
    default: 'Million tonnes CO-equivalents',
  },
  xAxisCategories: {
    type: Array as PropType<string[]>,
    default: () => ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
  },
  data: {
    type: Array as PropType<StackedAreaSeries[]>,
    default: (): StackedAreaSeries[] => [
      {
        name: 'Ocean transport',
        data: [13234, 12729, 11533, 17798, 10398, 12811, 15483, 16196, 15060, 13365, 13301],
      },
      {
        name: 'Households',
        data: [6686, 6536, 6389, 6384, 6251, 5719, 5611, 5040, 5079, 5088, 4988],
      },
      {
        name: 'Agriculture and hunting',
        data: [4812, 4872, 4961, 5001, 5070, 5035, 5045, 5004, 5015, 5076, 4935],
      },
      {
        name: 'Air transport',
        data: [3502, 3844, 4139, 4351, 3802, 4020, 4461, 5074, 1558, 1247, 2694],
      },
      {
        name: 'Construction',
        data: [2019, 2189, 2150, 2217, 2179, 2258, 2348, 2196, 2018, 2180, 2127],
      },
    ],
  },
});

const series = computed(() =>
  props.data.map(({ name, data, color }, index) => {
    const seriesColor = color ?? chartPalette[index % chartPalette.length];

    return {
      name,
      data,
      color: seriesColor,
      lineColor: withOpacity(seriesColor, 0.95),
    };
  }),
);

const options = computed(() => ({
  chart: {
    type: 'area',
    height: props.height,
    backgroundColor: 'transparent',
  },
  title: {
    text: props.title,
    ...chartTitleStyle,
  },
  subtitle: {
    text: props.subtitle,
    useHTML: true,
    style: {
      color: chartColors.textSecondary,
      fontSize: '12px',
    },
  },
  xAxis: {
    categories: props.xAxisCategories,
    tickmarkPlacement: 'on',
    lineColor: chartColors.divider,
    tickColor: chartColors.divider,
    labels: axisLabelStyle,
  },
  yAxis: {
    title: {
      text: props.yAxisTitle,
      ...axisTitleStyle,
    },
    gridLineColor: chartColors.dividerSoft,
    labels: axisLabelStyle,
  },
  legend: {
    align: 'left',
    verticalAlign: 'top',
    itemStyle: chartLegendStyle,
    symbolRadius: 999,
  },
  tooltip: {
    ...tooltipTheme,
    shared: true,
    headerFormat: '<span style="font-size:12px"><b>{point.key}</b></span><br/>',
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false,
      },
    },
    area: {
      stacking: 'normal',
      lineWidth: 1,
      lineColor: withOpacity(chartColors.textSecondary, 0.4),
      marker: {
        lineWidth: 1,
        lineColor: withOpacity(chartColors.textSecondary, 0.4),
      },
      fillOpacity: 0.88,
    },
  },
  series: series.value,
}));
</script>

<template>
  <highcharts :options="options" />
</template>

<style scoped></style>
