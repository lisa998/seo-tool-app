<template>
  <div class="grid gap-8">
    <common-card class="flex gap-4">
      <el-autocomplete
        v-model="targetDomain"
        :fetch-suggestions="suggestions"
        :trigger-on-focus="true"
        class="w-full"
        placeholder="輸入目標網址 (domain / URL / prefix)"
        @select="handleSelect"
      >
        <template v-slot="{ item }">
          <p>{{ item }}</p>
        </template>
      </el-autocomplete>
      <el-button class="w-[120px]" type="primary" @click="search">分析</el-button>
    </common-card>
    <div class="flex gap-4 h-[184px]">
      <template v-if="overviewLoading">
        <common-card v-for="i in 4" :key="i" class="flex-grow h-full">
          <div class="el-skeleton is-animated flex flex-col gap-4 h-full">
            <el-skeleton-item class="w-[40%]" variant="h3" />
            <el-skeleton-item class="w-[20%] ml-2" variant="h3" />
            <el-skeleton-item class="w-[80%] flex-1 self-center" variant="rect" />
          </div>
        </common-card>
      </template>
      <not-search-yet v-else-if="overviewData.length === 0" text="等待搜尋網址" />
      <template v-else>
        <common-card v-for="data in overviewData" :key="data.title" class="flex-grow h-full">
          <div class="flex flex-col gap-2 bg-white rounded-lg">
            <p class="text-text-secondary text-sm">{{ data.title }}</p>
            <p v-if="data?.metrics" class="text-text text-2xl ml-2">{{ data?.metrics }}</p>
            <div v-else class="h-1 w-4 bg-divider"></div>
            <SimplifiedLineGraph
              v-if="data?.sparklines"
              :data="data?.sparklines"
              :title="data.title"
              class="item-center flex justify-center"
            />
          </div>
        </common-card>
      </template>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="[tabName, tabItem] in tabConfigEntries"
        :key="tabName"
        :label="tabItem.label"
        :name="tabName"
        class="flex flex-col gap-6"
      >
        <div class="flex gap-2">
          <el-select
            v-for="selector in tabItem?.selectors"
            :key="selector.param"
            v-model="queryObject[tabName][selector.param]"
            :placeholder="selector.label"
            clearable
          >
            <el-option v-for="item in selector.options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <table-skeleton v-if="dataObject[activeTab]?.data.length === 0" :grid-cols="gridTemplate" />
        <div v-else class="overflow-hidden rounded-lg table-border">
          <virtual-scroll :items-length="dataObject[activeTab]?.data.length" :row-height="virtualScrollRowHeight">
            <template v-slot="{ startIndex, endIndex }">
              <Table
                :columnConfig="columnConfig"
                :data="virtualTable(startIndex, endIndex)"
                :gridTemplate="gridTemplate"
              >
                <template v-slot:source="{ row }">
                  <template v-if="row.source">
                    <a :href="`https://${row.source?.url}`" class="text-primary-active" target="_blank">
                      {{ row.source?.url }}
                    </a>
                    <div class="text-text-muted">{{ row.source?.title }}</div>
                  </template>
                </template>
                <template v-slot:anchorTargetUrl="{ row }">
                  <template v-if="row.anchorTargetUrl">
                    <div class="text-text">{{ row.anchorTargetUrl?.text }}</div>
                    <div class="text-text-muted text-sm">{{ row.anchorTargetUrl?.url }}</div>
                  </template>
                </template>
              </Table>
            </template>
          </virtual-scroll>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from '@nuxtjs/composition-api';
import SimplifiedLineGraph from '~/components/chart/SimplifiedLineGraph.vue';
import useSiteExplorerData from '~/pages/site-explorer/useSiteExplorerData';
import useApiQuery, { type LinkAnalysisKey } from '~/pages/site-explorer/useApiQuery';
import {
  columnConfigMap,
  exampleDomain,
  gridTemplateMap,
  tabConfig,
  type TabConfigItem,
  virtualScrollRowHeightMap,
} from '~/pages/site-explorer/constants';
import Table from '~/components/common/Table.vue';
import NotSearchYet from '~/components/common/NotSearchYet.vue';
import VirtualScroll from '~/components/common/VirtualScroll.vue';
import TableSkeleton from '~/components/common/TableSkeleton.vue';

const tabConfigEntries = Object.entries(tabConfig) as [LinkAnalysisKey, TabConfigItem][];

const targetDomain = ref('');
const { queryObject, activeTab, dataObject, fetchTableFuncArray } = useApiQuery(targetDomain);
const { fetchOverviewWithLoading, overviewData, overviewLoading } = useSiteExplorerData(targetDomain);

onMounted(async () => {
  await fetchOverviewWithLoading();
  await Promise.allSettled(fetchTableFuncArray.map((fn) => fn()));
});
const search = async () => {
  await fetchOverviewWithLoading();
  await Promise.allSettled(fetchTableFuncArray.map((fn) => fn()));
  await nextTick();
  window.dispatchEvent(new Event('resize'));
};
const columnConfig = computed(() => columnConfigMap[activeTab.value]);
const gridTemplate = computed(() => gridTemplateMap[activeTab.value]);

const virtualTable = computed(() => {
  const data = dataObject[activeTab.value]?.data || [];
  return (startIndex: number, endIndex: number) => data.slice(startIndex, endIndex);
});

const virtualScrollRowHeight = computed(() => virtualScrollRowHeightMap[activeTab.value]);
const suggestions = (value: string, cb: (d: string[]) => null) => {
  cb(exampleDomain);
};

const handleSelect = (item: string) => {
  targetDomain.value = item;
};
</script>

<style></style>
