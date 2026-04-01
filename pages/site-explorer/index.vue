<template>
  <div class="grid gap-6">
    <CommonCard class="flex gap-4">
      <el-input v-model="targetDomain"
                placeholder="輸入目標網址 (domain / URL / prefix)"/>
      <el-button class="w-[120px]" type="primary">分析</el-button>
    </CommonCard>
    <div class="flex gap-4">
      <CommonCard v-for="data in competitiveness" :key="data.title" class="flex-grow">
        <div class="flex flex-col gap-2 bg-white rounded-lg">
          <p class="text-text-secondary text-sm">{{ data.title }}</p>
          <p v-if="data?.metrics" class="text-text text-2xl ml-2">{{ data?.metrics }}</p>
          <div v-else class="h-1 w-4 bg-divider"></div>
          <SimplifiedLineGraph v-if="data?.sparklines" :data="data?.sparklines"
                               class="item-center flex justify-center"/>
        </div>
      </CommonCard>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="[tabName, tabItem] in tabConfigEntries" :label="tabItem.label" :name="tabName"
      >
        <div class="flex gap-2">
          <el-select v-for="selector in tabItem?.selectors" v-model="queryObject[tabName][selector.param]"
                     :placeholder="selector.label"
                     clearable>
            <el-option
                v-for="item in selector.options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "@nuxtjs/composition-api";
import SimplifiedLineGraph from "~/components/chart/SimplifiedLineGraph.vue";
import useSiteExplorerData from "~/pages/site-explorer/useSiteExplorerData";
import useApiQuery, {type LinkAnalysisKey} from "~/pages/site-explorer/useApiQuery";
import {tabConfig, type TabConfigItem} from "~/pages/site-explorer/constants";

const tabConfigEntries = Object.entries(tabConfig) as [LinkAnalysisKey, TabConfigItem][]

const targetDomain = ref('')
const {competitiveness} = useSiteExplorerData()

const options = [
  {value: "referring-domains", label: "參照網域"},
  {value: "external-links", label: "外部連結"},
  {value: "followed-links", label: "Followed 連結"},
  {value: "nofollowed-links", label: "Nofollowed 連結"}
]
const {queryObject, activeTab} = useApiQuery()


</script>

<style>

</style>