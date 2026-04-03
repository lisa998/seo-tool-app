<template>
  <div class="grid gap-8">
    <CommonCard class="flex gap-4">
      <el-input v-model="targetDomain" placeholder="輸入目標網址 (domain / URL / prefix)" />
      <el-button class="w-[120px]" type="primary">分析</el-button>
    </CommonCard>
    <div class="flex gap-4">
      <CommonCard v-for="data in competitiveness" :key="data.title" class="flex-grow">
        <div class="flex flex-col gap-2 bg-white rounded-lg">
          <p class="text-text-secondary text-sm">{{ data.title }}</p>
          <p v-if="data?.metrics" class="text-text text-2xl ml-2">{{ data?.metrics }}</p>
          <div v-else class="h-1 w-4 bg-divider"></div>
          <SimplifiedLineGraph
            v-if="data?.sparklines"
            :data="data?.sparklines"
            class="item-center flex justify-center"
          />
        </div>
      </CommonCard>
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
        <Table :columnConfig="columnConfig" :data="data" gridTemplate="grid-cols-[4fr_3fr_1fr_1fr_1fr_2fr]">
          <template v-slot:source="{ row }">
            <a :href="`https://${row.source.url}`" class="text-primary-active hover:underline" target="_blank">
              {{ row.source.url }}
            </a>
            <div class="text-text-muted">{{ row.source.title }}</div>
          </template>
          <template v-slot:anchorTargetUrl="{ row }">
            <div class="text-text">{{ row.anchorTargetUrl.text }}</div>
            <div class="text-text-muted text-sm">{{ row.anchorTargetUrl.url }}</div>
          </template>
        </Table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from '@nuxtjs/composition-api';
import SimplifiedLineGraph from '~/components/chart/SimplifiedLineGraph.vue';
import useSiteExplorerData from '~/pages/site-explorer/useSiteExplorerData';
import useApiQuery, { type LinkAnalysisKey } from '~/pages/site-explorer/useApiQuery';
import { tabConfig, type TabConfigItem } from '~/pages/site-explorer/constants';
import Table from '~/components/common/Table.vue';

const tabConfigEntries = Object.entries(tabConfig) as [LinkAnalysisKey, TabConfigItem][];

const targetDomain = ref('');
const { queryObject, activeTab } = useApiQuery();
const { competitiveness } = useSiteExplorerData();
const columnConfig = [
  { title: '來源頁面', key: 'source', slot: true },
  { title: '錨文本/目標URL', key: 'anchorTargetUrl', slot: true },
  { title: 'DR', key: 'dr', slot: false },
  { title: 'UR', key: 'ur', slot: false },
  { title: '流量', key: 'traffic', slot: false },
  { title: '首見日期', key: 'firstSeenDate', slot: false },
];

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
