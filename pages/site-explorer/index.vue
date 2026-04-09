<template>
  <div class="grid gap-8">
    <common-card class="flex gap-4">
      <el-input v-model="targetDomain" placeholder="輸入目標網址 (domain / URL / prefix)" />
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
        <Table :columnConfig="columnConfig" :data="dataObject[activeTab]?.data" :gridTemplate="gridTemplate">
          <template v-slot:source="{ row }">
            <template v-if="row.source">
              <a :href="`https://${row.source?.url}`" class="text-primary-active hover:underline" target="_blank">
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from '@nuxtjs/composition-api';
import SimplifiedLineGraph from '~/components/chart/SimplifiedLineGraph.vue';
import useSiteExplorerData from '~/pages/site-explorer/useSiteExplorerData';
import useApiQuery, { type LinkAnalysisKey } from '~/pages/site-explorer/useApiQuery';
import { columnConfigMap, gridTemplateMap, tabConfig, type TabConfigItem } from '~/pages/site-explorer/constants';
import Table from '~/components/common/Table.vue';
import NotSearchYet from '~/components/common/NotSearchYet.vue';

const tabConfigEntries = Object.entries(tabConfig) as [LinkAnalysisKey, TabConfigItem][];

const targetDomain = ref('');
const { queryObject, activeTab, dataObject, fetchTableFuncArray } = useApiQuery();
const { fetchOverviewWithLoading, overviewData, overviewLoading } = useSiteExplorerData();

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

const data = [
  {
    source: {
      title: 'Title...',
      url: 'example1.com/page-1',
    },
    anchorTargetUrl: {
      text: 'SEO 工具介紹',
      url: 'target-site.com/seo-tools',
    },
    dr: 72,
    ur: 38,
    traffic: 1250,
    firstSeenDate: '2026-03-01',
  },
  {
    source: {
      title: 'example2.com/page-1',
      url: 'example2.com/page-1',
    },
    anchorTargetUrl: {
      text: '關鍵字研究',
      url: 'target-site.com/keyword-research',
    },
    dr: 65,
    ur: 41,
    traffic: 980,
    firstSeenDate: '2026-03-05',
  },
  {
    source: {
      title: 'example3.com/blog-2',
      url: 'https://example3.com/blog-2',
    },
    anchorTargetUrl: {
      text: '反向連結分析',
      url: 'https://target-site.com/backlink-analysis',
    },
    dr: 58,
    ur: 35,
    traffic: 760,
    firstSeenDate: '2026-03-08',
  },
  {
    source: {
      title: 'example4.com/article-3',
      url: 'https://example4.com/article-3',
    },
    anchorTargetUrl: {
      text: '網站健檢',
      url: 'https://target-site.com/site-audit',
    },
    dr: 80,
    ur: 49,
    traffic: 2100,
    firstSeenDate: '2026-03-12',
  },
  {
    source: {
      title: 'example5.com/post-4',
      url: 'https://example5.com/post-4',
    },
    anchorTargetUrl: {
      text: '內容優化',
      url: 'https://target-site.com/content-optimization',
    },
    dr: 69,
    ur: 43,
    traffic: 1430,
    firstSeenDate: '2026-03-18',
  },
];
</script>

<style></style>
