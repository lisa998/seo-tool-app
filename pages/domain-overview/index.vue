<template>
  <div class="flex flex-col gap-4">
    <common-card class="flex gap-2">
      <el-input v-model="targetDomain" placeholder="ahrefs.com" />
      <el-button type="primary">概覽</el-button>
      <el-button class="!ml-0">自然搜尋</el-button>
      <el-button class="!ml-0">付費搜尋</el-button>
      <el-button class="!ml-0">反連</el-button>
    </common-card>
    <div class="grid grid-cols-3 gap-4">
      <common-card v-for="data in competitiveness" :key="data.title" class="flex flex-col items-center gap-2">
        <p class="text-text-secondary text-sm">{{ data.title }}</p>
        <p v-if="data?.metrics" class="text-text text-2xl">{{ data?.metrics }}</p>
        <format-number :decimals="1" :value="Number(data?.variation)" />
      </common-card>
    </div>
    <div class="flex justify-end gap-1">
      <el-button
        v-for="btn in timeButton"
        :key="btn.value"
        :type="activeTime === btn.value ? 'primary' : ''"
        :value="btn.value"
        size="small"
        @click="activeTime = btn.value"
      >
        {{ btn.label }}
      </el-button>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <common-card>
        <Areaspline hoverText="hover" title="自然流量趨勢" />
      </common-card>
      <common-card>
        <spline title="參照網域增長" />
      </common-card>
      <common-card>
        <bar title="流量來源國家" />
      </common-card>
      <common-card>
        <bar title="Top 關鍵字" />
      </common-card>
    </div>
    <div class="grid grid-cols-[1fr_2fr] gap-4">
      <common-card>
        <donut-chart title="流量來源國家" />
      </common-card>
      <common-card>
        <column-chart title="Top 關鍵字" />
      </common-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from '@nuxtjs/composition-api';
import FormatNumber from '~/components/common/FormatNumber.vue';
import Areaspline from '~/components/chart/Areaspline.vue';
import Spline from '~/components/chart/Spline.vue';
import Bar from '~/components/chart/Bar.vue';
import DonutChart from '~/components/chart/DonutChart.vue';
import ColumnChart from '~/components/chart/ColumnChart.vue';

const targetDomain = ref('');
const competitiveness = [
  {
    title: 'Ahrefs Rank',
    metrics: '#83',
    variation: -12,
  },
  {
    title: 'DR',
    metrics: '92',
    variation: 0,
  },
  {
    title: '反向連結',
    metrics: '24.5M',
    variation: 1200000,
  },
];

const timeButton = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
];
const activeTime = ref('7d');
</script>
