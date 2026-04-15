<template>
  <div class="flex flex-col gap-4">
    <common-card class="flex gap-2">
      <common-domain-autocomplete v-model="targetDomain" placeholder="example.com" />
      <el-button :disabled="isFetching" type="primary" @click="search">概覽</el-button>
    </common-card>
    <div class="h-[106px]">
      <div v-if="summaryLoading" class="grid grid-cols-3 gap-4 h-full">
        <common-card v-for="i in 3" :key="i" class="flex-grow h-full">
          <div class="el-skeleton is-animated flex flex-col gap-4 h-full items-center">
            <el-skeleton-item class="w-[40%]" variant="text" />
            <el-skeleton-item class="w-[50%] ml-2" variant="h1" />
            <el-skeleton-item class="w-[20%] ml-2" variant="text" />
          </div>
        </common-card>
      </div>
      <not-search-yet v-else-if="summaryData.length === 0" text="等待搜尋網址" />
      <div v-else class="grid grid-cols-3 gap-4">
        <common-card v-for="data in summaryData" :key="data.title" class="flex flex-col items-center gap-2">
          <p class="text-text-secondary text-sm">{{ data?.title }}</p>
          <p v-if="data?.metrics" class="text-text text-2xl">{{ data?.metrics }}</p>
          <format-number :decimals="1" :value="Number(data?.variation)" />
        </common-card>
      </div>
    </div>
    <div class="flex justify-end gap-1">
      <el-button
        v-for="btn in timeButton"
        :key="btn.value"
        :type="activeTime === btn.value ? 'primary' : ''"
        :value="btn.value"
        size="small"
        @click="clickTimeBtn(btn.value)"
      >
        {{ btn.label }}
      </el-button>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <common-card class="h-[316px]">
        <chart-skeleton v-if="trafficTrendLoading" />
        <not-search-yet v-else-if="trafficTrendChartData.xAxisCategories.length === 0" />
        <Areaspline
          v-else
          :data="trafficTrendChartData.series"
          :x-axis-categories="trafficTrendChartData.xAxisCategories"
          title="流量趨勢"
        />
      </common-card>
      <common-card class="h-[316px]">
        <chart-skeleton v-if="referringDomainsGrowthLoading" />
        <not-search-yet v-else-if="referringDomainsGrowthChartData.xAxisCategories.length === 0" />
        <spline
          v-else
          :data="referringDomainsGrowthChartData.series"
          :x-axis-categories="referringDomainsGrowthChartData.xAxisCategories"
          :y-axes="[{ title: '總參照網域' }, { title: '每期變化', opposite: true }]"
          title="參照網域增長"
        />
      </common-card>
      <common-card class="h-[376px]">
        <chart-skeleton v-if="trafficByCountryLoading" />
        <not-search-yet v-else-if="trafficByCountryChartData.categories.length === 0" />
        <bar
          v-else
          :categories="trafficByCountryChartData.categories"
          :data="trafficByCountryChartData.data"
          :height="360"
          :series-name="trafficByCountryChartData.seriesName"
          title="流量來源國家"
        />
      </common-card>
      <common-card class="h-[376px]">
        <chart-skeleton v-if="topKeywordsLoading" />
        <not-search-yet v-else-if="topKeywordsChartData.categories.length === 0" />
        <bar
          v-else
          :categories="topKeywordsChartData.categories"
          :data="topKeywordsChartData.data"
          :height="360"
          :series-name="topKeywordsChartData.seriesName"
          title="Top 關鍵字"
        />
      </common-card>
    </div>
    <div ref="lastChartsRef" class="grid grid-cols-[1fr_2fr] gap-4">
      <common-card class="h-[336px]">
        <chart-skeleton v-if="linkTypeDistributionLoading" />
        <not-search-yet v-else-if="linkTypeDistributionChartData.data.length === 0" />
        <donut-chart
          v-else
          :data="linkTypeDistributionChartData.data"
          :height="320"
          :series-name="linkTypeDistributionChartData.seriesName"
          title="連結類型分佈"
        />
      </common-card>
      <common-card class="h-[336px]">
        <chart-skeleton v-if="backlinksNewLostLoading" />
        <not-search-yet v-else-if="backlinksNewLostChartData.categories.length === 0" />
        <column-chart
          v-else
          :categories="backlinksNewLostChartData.categories"
          :height="320"
          :series="backlinksNewLostChartData.series"
          title="每月新增/流失反連"
          y-axis-title="反連數"
        />
      </common-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from '@nuxtjs/composition-api';
import FormatNumber from '~/components/common/FormatNumber.vue';
import Areaspline from '~/components/chart/Areaspline.vue';
import Spline from '~/components/chart/Spline.vue';
import Bar from '~/components/chart/Bar.vue';
import DonutChart from '~/components/chart/DonutChart.vue';
import ColumnChart from '~/components/chart/ColumnChart.vue';
import useSummary from '~/pages/domain-overview/useSummary';
import NotSearchYet from '~/components/common/NotSearchYet.vue';
import useTrafficTrend from '~/pages/domain-overview/useTrafficTrend';
import ChartSkeleton from '~/components/chart/ChartSkeleton.vue';
import useReferringDomainsGrowth from '~/pages/domain-overview/useReferringDomainsGrowth';
import useTrafficByCountry from '~/pages/domain-overview/useTrafficByCountry';
import useTopKeywords from '~/pages/domain-overview/useTopKeywords';
import useLinkTypeDistribution from '~/pages/domain-overview/useLinkTypeDistribution';
import useBacklinksNewLost from '~/pages/domain-overview/useBacklinksNewLost';
import useLazyFetchOnVisible from '~/composables/useLazyFetchOnVisible';

const targetDomain = ref('');

const timeButton = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
];
const activeTime = ref('6m');
const topKeywordsLimit = ref(8);

const { fetchSummary, summaryLoading, summaryData } = useSummary(targetDomain);

const { fetchTrafficTrend, trafficTrendLoading, trafficTrendChartData } = useTrafficTrend(targetDomain, activeTime);
const { fetchReferringDomainsGrowth, referringDomainsGrowthLoading, referringDomainsGrowthChartData } =
  useReferringDomainsGrowth(targetDomain, activeTime);
const { fetchTrafficByCountry, trafficByCountryLoading, trafficByCountryChartData } = useTrafficByCountry(targetDomain);
const { fetchTopKeywords, topKeywordsLoading, topKeywordsChartData } = useTopKeywords(targetDomain, topKeywordsLimit);
const { fetchLinkTypeDistribution, linkTypeDistributionLoading, linkTypeDistributionChartData } =
  useLinkTypeDistribution(targetDomain);
const { fetchBacklinksNewLost, backlinksNewLostLoading, backlinksNewLostChartData } = useBacklinksNewLost(
  targetDomain,
  activeTime,
);

const isFetching = computed(
  () =>
    summaryLoading.value ||
    trafficTrendLoading.value ||
    referringDomainsGrowthLoading.value ||
    trafficByCountryLoading.value ||
    topKeywordsLoading.value ||
    linkTypeDistributionLoading.value ||
    backlinksNewLostLoading.value,
);

const lastChartsRef = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  await Promise.allSettled([
    fetchSummary(),
    fetchTrafficTrend(),
    fetchReferringDomainsGrowth(),
    fetchTrafficByCountry(),
    fetchTopKeywords(),
  ]);
});

const fetchLastCharts = async () => {
  if (isFetching.value) return;
  await Promise.allSettled([fetchLinkTypeDistribution(), fetchBacklinksNewLost()]);
};

const { fetchIfVisible, markPendingRefresh } = useLazyFetchOnVisible(lastChartsRef, fetchLastCharts);

const search = async () => {
  markPendingRefresh();
  await Promise.allSettled([
    fetchSummary(),
    fetchTrafficTrend(),
    fetchReferringDomainsGrowth(),
    fetchTrafficByCountry(),
    fetchTopKeywords(),
  ]);
  await fetchIfVisible();
};

const clickTimeBtn = async (value: string) => {
  activeTime.value = value;
  if (!targetDomain.value) return;
  await Promise.allSettled([fetchTrafficTrend(), fetchReferringDomainsGrowth(), fetchBacklinksNewLost()]);
};
</script>
