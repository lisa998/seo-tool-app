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
          <div :class="{ 'no-result': item.disabled }">
            {{ item.keyword }}
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
    <div class="grid grid-cols-2 gap-4">
      <common-card>
        <bar title="搜尋量趨勢（12 個月）" />
      </common-card>
      <common-card> </common-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useSearch from '~/pages/keyword-explorer/useSearch';
import useOverview, { metricEntries } from '~/pages/keyword-explorer/useOverview';
import Bar from '~/components/chart/Bar.vue';

const { search, querySearch, handleSelect } = useSearch();

const { searchAction, overviewData } = useOverview(search);
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
