<template>
  <div class="grid gap-6 min-w-0">
    <div class="grid gap-2 grid-cols-4 grid-col">
      <common-card
        v-for="item in summaryCard"
        :key="item.title"
        :style="{ color: item.iconColor }"
        class="flex flex-col items-center gap-1"
      >
        <i :class="item.icon"></i>
        <div class="text-xs">{{ item.title }}</div>
        <div v-if="!item.value" class="el-skeleton is-animated p-2">
          <el-skeleton-item variant="h3" />
        </div>
        <div v-else class="text-xl font-bold">{{ item.value }}</div>
      </common-card>
    </div>
    <div class="grid gap-2 xl:grid-cols-[3fr_2fr] grid-cols-1">
      <common-card class="h-[316px]">
        <chart-skeleton v-if="distributionLoading" />
        <error-img v-else-if="distributionError" />
        <ClientOnly v-else>
          <stacked-area
            :data="distributionChartData.data"
            :x-axis-categories="distributionChartData.xAxisCategories"
            subtitle=""
            title="排名分佈變化"
            y-axis-title="關鍵字數量"
          />
        </ClientOnly>
      </common-card>
      <common-card class="flex flex-col gap-4">
        <h3 class="flex items-center gap-1 text-text-secondary">
          <i class="el-icon-bell"></i>
          通知規則
        </h3>
        <table-skeleton v-if="notificationRulesLoading" :grid-cols="gridTemplate" />
        <error-img v-else-if="notificationRulesError" class="h-[150px]" />
        <div v-else>
          <Table
            :columnConfig="notiColumnConfig"
            :data="notificationRules || []"
            :gridTemplate="notiGridTemplate"
            :sticky-header="false"
            class="text-xs"
            size="xs"
          >
            <template v-slot:enabled="{ row }">
              <el-switch v-model="row.enabled"></el-switch>
            </template>
          </Table>
        </div>
        <el-button
          class="w-full border-border"
          icon="el-icon-plus"
          size="small"
          type="text"
          @click="notiDialogVisible = true"
        >
          新增通知規則
        </el-button>
      </common-card>
    </div>
    <div class="grid gap-4">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          v-for="tab in tabConfig"
          :key="tab.title"
          :label="tab.title"
          :name="tab.value"
          class="flex flex-col gap-6"
        >
        </el-tab-pane>
      </el-tabs>

      <div class="flex gap-4 items-center flex-wrap">
        <el-input v-model="searchKeyword" class="flex-1" clearable placeholder="搜尋關鍵字" />
        <el-select v-model="activeTag" class="w-48" clearable filterable placeholder="Tag 篩選">
          <el-option v-for="tag in tags?.tags" :key="tag?.name" :label="tag?.name" :value="tag?.name" />
          <el-option v-if="tagsLoading" disabled>loading...</el-option>
          <el-option v-if="tagsError" disabled>載入失敗</el-option>
        </el-select>
        <el-select v-model="sort" class="w-40" placeholder="排序方法">
          <el-option v-for="option in sortOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-select v-model="limit" class="w-40" placeholder="每頁筆數">
          <el-option v-for="option in limitOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </div>
      <div class="flex gap-2 items-center flex-wrap">
        <el-checkbox v-model="checkedAll" border class="bg-white m-0" label="全部選取" size="small"></el-checkbox>
        <el-checkbox
          :disabled="!selectKeywordIds.length"
          :label="`取消已選取 ${selectKeywordIds.length} 個關鍵字`"
          :value="selectKeywordIds.length > 0"
          border
          size="small"
          @change="cancelCheckedAll"
        ></el-checkbox>

        <el-button
          class="ml-4"
          icon="el-icon-refresh"
          size="small"
          type="primary"
          @click="onKeywordBatch('refreshRank')"
        >
          更新排名
        </el-button>
        <el-button icon="el-icon-delete-solid" size="small" type="danger" @click="onKeywordBatch('delete')">
          刪除
        </el-button>
        <el-popover placement="right" trigger="click" width="400">
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <el-button
                v-for="btn in operateTagButton"
                :key="btn.value"
                :type="operateAction === btn.value ? 'primary' : ''"
                :value="btn.value"
                size="small"
                @click="operateAction = btn.value"
              >
                {{ btn.label }}
              </el-button>
            </div>
            <div class="flex gap-2 items-center">
              <div v-if="operateAction === 'removeTag'" class="w-full flex gap-2 items-center">
                <el-select v-model="operateTag" class="w-full" clearable filterable placeholder="可選常用標籤：">
                  <el-option v-for="tag in tags?.tags" :key="tag?.name" :label="tag?.name" :value="tag?.name" />
                  <el-option v-if="tagsLoading" disabled>loading...</el-option>
                  <el-option v-if="tagsError" disabled>載入失敗</el-option>
                </el-select>
                <span>或</span>
              </div>
              <el-input
                v-model="operateTag"
                class="w-full"
                placeholder="輸入標籤名稱"
                @keyup.enter.native="onEditTag"
              />
            </div>
            <span v-if="editTagWaring" class="text-danger text-xs">請勾選關鍵字，輸入Tag名稱</span>
            <el-button size="small" type="primary" @click="onEditTag">送出</el-button>
          </div>
          <el-button slot="reference" size="small" type="primary">管理標籖</el-button>
        </el-popover>
      </div>
      <div>
        <el-alert
          v-if="batchFailedIds.length"
          :closable="true"
          :description="`以下關鍵字操作失敗：${batchFailedIds.join('、')}`"
          class="mb-2"
          show-icon
          title="部分標籤操作失敗"
          type="error"
          @close="batchFailedIds = []"
        />
        <table-skeleton v-if="keywordsLoading && !keywordsLength" :grid-cols="gridTemplate" :row-count="15" />
        <error-img v-else-if="keywordsError" class="h-[300px]" />
        <div v-else>
          <div class="table-border">
            <virtual-scroll :items-length="keywordsLength" :row-height="41">
              <template v-slot="{ startIndex, endIndex }">
                <Table
                  :columnConfig="columnConfig"
                  :data="virtualTable(startIndex, endIndex)"
                  :gridTemplate="gridTemplate"
                  min-width="900px"
                >
                  <template v-slot:checkbox="{ row }">
                    <el-checkbox :value="isKeywordSelected(row.id)" @change="toggleSelect($event, row.id)" />
                  </template>

                  <template v-slot:tags="{ row }">
                    <div class="flex items-center gap-1 flex-nowrap">
                      <el-tag v-if="row.tags?.length" effect="dark" size="mini">
                        {{ row.tags[0] }}
                      </el-tag>
                      <el-tooltip
                        v-if="row.tags?.length > 1"
                        :content="row.tags.slice(1).join('、')"
                        placement="top"
                        popper-class="!bg-primary-active !text-white"
                      >
                        <el-tag class="cursor-default" effect="plain" size="mini"> +{{ row.tags.length - 1 }}</el-tag>
                      </el-tooltip>
                    </div>
                  </template>

                  <template v-slot:current="{ row }">
                    <div class="text-center text-success font-medium">
                      {{ row.current }}
                    </div>
                  </template>

                  <template v-slot:change="{ row }">
                    <div
                      :class="Number(row.change) >= 0 ? 'text-success' : 'text-danger'"
                      class="text-center font-medium"
                    >
                      {{ Number(row.change) >= 0 ? `+${row.change}` : row.change }}
                    </div>
                  </template>

                  <template v-slot:trend="{ row }">
                    <div class="flex items-center justify-center">
                      <simplified-line-graph v-if="row.trend" :data="row.trend" :height="20" :width="40" />
                      <span v-else class="text-text-muted">-</span>
                    </div>
                  </template>

                  <template v-slot:actions="{ row }">
                    <el-dropdown trigger="click">
                      <el-button class="py-1 px-2" type="primary"> ...</el-button>

                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item> 編輯</el-dropdown-item>
                          <el-dropdown-item> 刪除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </Table>
              </template>
            </virtual-scroll>
          </div>
          <div class="mt-2 grid grid-cols-3">
            <span class="text-text-secondary text-sm ml-2">
              顯示總筆數： {{ keywords?.data?.length }}/{{ keywords?.pagination?.total }}
            </span>
            <el-button
              v-if="keywords?.pagination?.hasMore"
              :disabled="keywordsLoading"
              class="items-center"
              size="small"
              @click="loadMore"
            >
              <div v-if="!keywordsLoading" class="items-center">
                <i class="el-icon-caret-bottom"></i>
                載入更多
                <i class="el-icon-caret-bottom"></i>
              </div>
              <loading-square v-else class="mt-1 ml-2"></loading-square>
            </el-button>
            <span v-else class="text-center text-text-secondary">沒有更多了</span>
            <div></div>
          </div>
        </div>
      </div>
    </div>

    <notification-rules-form
      :dialog-visible="notiDialogVisible"
      @cancel="notiDialogVisible = false"
      @submit="addNewRules"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from '@nuxtjs/composition-api';
import useDistribution from '~/pages/rank-tracker/useDistribution';
import useKeywords from '~/pages/rank-tracker/useKeywords';
import useNotificationRules from '~/pages/rank-tracker/useNotificationRules';
import useTags from '~/pages/rank-tracker/useTags';
import { NotificationRulesFormType, RankTrackerKeywordsTab } from '~/pages/rank-tracker/types';
import ErrorImg from '~/components/common/ErrorImg.vue';
import ChartSkeleton from '~/components/chart/ChartSkeleton.vue';
import StackedArea from '~/components/chart/StackedArea.vue';
import Table from '~/components/common/Table.vue';
import VirtualScroll from '~/components/common/VirtualScroll.vue';
import TableSkeleton from '~/components/common/TableSkeleton.vue';
import SimplifiedLineGraph from '~/components/chart/SimplifiedLineGraph.vue';
import {
  columnConfig,
  gridTemplate,
  limitOptions,
  notiColumnConfig,
  notiGridTemplate,
  operateTagButton,
  sortOptions,
  tabConfig,
} from './constants';
import NotificationRulesForm from '~/components/rank-tracker/NotificationRulesForm.vue';
import useKeywordFilter from '~/pages/rank-tracker/useKeywordFilter';
import useKeywordSelection from '~/pages/rank-tracker/useKeywordSelection';
import useKeywordTable from '~/pages/rank-tracker/useKeywordTable';
import { ruleToPayloadMapper } from '~/mappers/rank-tracker/rules.mapper';
import useKeywordBatch from '~/pages/rank-tracker/useKeywordBatch';
import LoadingSquare from '~/components/common/LoadingSquare.vue';

const activeTab = ref<RankTrackerKeywordsTab>('all');
const cursor = ref<string | null>(null);
const { searchKeyword, activeSearch, activeTag, sort, limit } = useKeywordFilter();

const { keywords, fetchKeywords, keywordsLoading, keywordsError, summaryCard, loadMore } =
  useKeywords(activeTab, cursor, limit, activeTag, sort);
const { virtualTable, keywordsLength } = useKeywordTable(keywords, activeSearch);
const { fetchDistribution, distributionLoading, distributionError, distributionChartData } = useDistribution();
const { tags, fetchTags, tagsLoading, tagsError } = useTags();
const {
  notificationRules,
  fetchNotificationRules,
  notificationRulesLoading,
  notificationRulesError,
  createNotificationRule,
} = useNotificationRules();

const { selectKeywordIds, checkedAll, isKeywordSelected, toggleSelect, cancelCheckedAll } =
  useKeywordSelection(keywords);

const { onKeywordBatch, onEditTag, operateTag, operateAction, editTagWaring, batchFailedIds } = useKeywordBatch(
  selectKeywordIds,
  keywords,
);

onMounted(() => {
  void Promise.allSettled([fetchKeywords(), fetchDistribution(), fetchTags(), fetchNotificationRules()]);
});

const notiDialogVisible = ref(false);
const addNewRules = (form: NotificationRulesFormType) => {
  createNotificationRule(ruleToPayloadMapper(form));
  notiDialogVisible.value = false;
};
</script>
