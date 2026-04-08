<template>
  <div class="grid gap-6">
    <common-card class="flex gap-4">
      <el-autocomplete
        v-model="search.keyword"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        class="w-full"
        placeholder="輸入關鍵字..."
        @select="handleSelect"
      >
        <template v-slot="{ item }">
          <div :class="{ 'no-result': item.disabled }" class="flex justify-between items-center">
            <p>{{ item.keyword }}</p>
            <p v-if="!item.disabled" class="text-text-muted text-sm">vol: {{ item.volume }}</p>
          </div>
        </template>
      </el-autocomplete>
      <el-button class="w-[120px]" type="primary" @click="searchAction">搜尋</el-button>
    </common-card>
    <div class="grid grid-cols-5 gap-4">
      <common-card v-for="[key, title] in metricEntries" class="grid gap-4">
        <p class="text-text-secondary text-sm">{{ title }}</p>
        <p v-if="overviewData?.[key]" class="text-text text-2xl">{{ overviewData?.[key] }}</p>
        <div v-else class="h-1 w-4 bg-divider text-center justify-self-center"></div>
      </common-card>
    </div>
    <div class="grid gap-6">
      <div class="grid grid-cols-2 gap-4">
        <common-card class="relative h-[400px]">
          <chart-skeleton v-if="volumeTrendLoading" />
          <not-search-yet v-else-if="barData.data.length === 0" />
          <bar
            v-else
            :categories="barData.categories"
            :data="barData.data"
            :height="380"
            series-name="月搜尋量"
            title="搜尋量趨勢（12 個月）"
          />
        </common-card>
        <common-card class="relative h-[400px]">
          <chart-skeleton v-if="serpFeaturesLoading" />
          <not-search-yet v-else-if="heatmapData.features.length === 0" />
          <heatmap
            v-else
            :data="heatmapData.features"
            :height="380"
            :x-axis-categories="heatmapData.date"
            :y-axis-categories="allSerpFeatures"
            title="SERP 功能分佈"
            y-axis-title="Features"
          />
        </common-card>
      </div>
      <common-card class="relative min-h-[150px]">
        <div v-if="serpRankingLoading" class="bg-white">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item style="width: 20%; margin-bottom: 12px" variant="h3" />
              <div v-for="row in 6" :key="row" class="grid grid-cols-[1fr_6fr_1fr_1fr_2fr_2fr] gap-2 mb-4">
                <el-skeleton-item v-for="i in 6" :key="'cell-' + row + '-' + i" variant="text" />
              </div>
            </template>
          </el-skeleton>
        </div>
        <not-search-yet v-else-if="tableSerpData.length === 0" />
        <div v-else>
          <h3 class="text-text-secondary mb-2">SERP 排名結果</h3>
          <Table :column-config="columnConfig" :data="tableSerpData" gridTemplate="grid-cols-[1fr_6fr_1fr_1fr_2fr_2fr]">
            <template v-slot:rank="{ row }">
              <span :class="row.rank < 4 ? 'text-accent' : ''">{{ row.rank }}</span>
            </template>
            <template v-slot:url="{ row }">
              <a :href="`https://${row.url}`" class="text-primary-active hover:underline" target="_blank">{{
                row.url
              }}</a>
            </template>
          </Table>
        </div>
      </common-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useSearch from '~/pages/keyword-explorer/useSearch';
import useOverview, { metricEntries } from '~/pages/keyword-explorer/useOverview';
import Bar from '~/components/chart/Bar.vue';
import Heatmap from '~/components/chart/Heatmap.vue';
import useSerpRanking from '~/pages/keyword-explorer/useSerpRanking';
import { nextTick, onMounted, useFetch } from '@nuxtjs/composition-api';
import Table from '~/components/common/Table.vue';
import useVolumeTrend from '~/pages/keyword-explorer/useVolumeTrend';
import useSerpFeaturesHistory from '~/pages/keyword-explorer/useSerpFeaturesHistory';
import ChartSkeleton from '~/components/chart/ChartSkeleton.vue';
import NotSearchYet from '~/components/common/NotSearchYet.vue';

const { search, querySearch, handleSelect } = useSearch();

const { overviewData, fetchOverview } = useOverview(search);

const { tableSerpData, serpRankingLoading, fetchSerpRanking } = useSerpRanking(search);

const { barData, volumeTrendLoading, fetchVolumeTrend } = useVolumeTrend(search);

const { heatmapData, allSerpFeatures, serpFeaturesLoading, fetchSerpFeaturesHistory } = useSerpFeaturesHistory(search);

useFetch(async () => {
  await Promise.allSettled([fetchOverview(), fetchSerpRanking()]);
});

//high-chart data fetch in client
onMounted(async () => {
  await Promise.allSettled([fetchVolumeTrend(), fetchSerpFeaturesHistory()]);
});

const searchAction = async () => {
  await Promise.allSettled([fetchOverview(), fetchSerpRanking(), fetchVolumeTrend(), fetchSerpFeaturesHistory()]);
  await nextTick();
  window.dispatchEvent(new Event('resize'));
};

const columnConfig = [
  { title: '#', key: 'rank', slot: true },
  { title: '網頁', key: 'url', slot: true },
  { title: 'DR', key: 'dr', slot: false },
  { title: 'UR', key: 'ur', slot: false },
  { title: '反連數', key: 'backlinks', slot: false },
  { title: '流量', key: 'traffic', slot: false },
];
</script>
<style lang="scss" scoped>
.no-result {
  color: #999;
  pointer-events: none;
  cursor: default;

  &:hover {
    background: transparent;
  }
}
</style>
