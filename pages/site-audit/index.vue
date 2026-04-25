<template>
  <div class="grid gap-6">
    <common-card>
      <div class="flex justify-between items-center">
        <h3>爬取進度</h3>
        <div class="text-text-secondary text-[12px]">{{ page }}</div>
      </div>
      <el-progress :percentage="percentage" :status="linerProgressStatus"></el-progress>
      <div class="flex justify-between text-text-muted text-sm">
        <span>開始：{{ passedTime }}</span>
        <span>速度：{{ progress.speed }}頁/秒</span>
        <span>預計剩餘：{{ timeLeft }}</span>
      </div>
    </common-card>
    <div class="flex gap-6">
      <common-card class="flex flex-col items-center w-fit health-score">
        <div class="text-center text-text-muted mb-2">健康分數</div>
        <el-progress
          v-if="progress.healthScore"
          :color="customColors"
          :format="formatCircleProgress"
          :percentage="progress.healthScore || 0"
          :width="100"
          text-color="#6f5c54"
          type="circle"
        ></el-progress>
        <div v-else class="health-score__placeholder">-</div>
      </common-card>
      <common-card class="flex-grow gap-2 grid">
        <h3>問題摘要</h3>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="item in summary"
            :style="{ color: item.color, backgroundColor: item.color + '20' }"
            class="p-4 rounded-lg flex flex-col items-center justify-center"
          >
            <div class="text-2xl font-bold">{{ item.data }}</div>
            <div class="text-sm">{{ item.name }}</div>
          </div>
        </div>
      </common-card>
    </div>
    <common-card class="grid gap-2">
      <h3>問題分類</h3>
      <div v-if="isRunnerCompleted" class="flex gap-2 flex-col">
        <div class="flex gap-1">
          <el-button
            v-for="btn in categoryOptions"
            :key="btn.value"
            :type="activeCategory === btn.value ? 'primary' : ''"
            :value="btn.value"
            size="mini"
            @click="activeCategory = btn.value"
          >
            {{ btn.label }}
          </el-button>
        </div>
        <div class="flex gap-1">
          <el-button
            v-for="btn in severityOptions"
            :key="btn.value"
            :type="activeSeverity === btn.value ? 'info' : ''"
            :value="btn.value"
            size="mini"
            @click="activeSeverity = btn.value"
          >
            {{ btn.label }}
          </el-button>
        </div>
      </div>
      <div v-if="!isRunnerCompleted" class="text-text-muted mb-4 flex gap-1 items-center">
        <div class="text-lg">Loading</div>
        <loading-square class="mt-1 ml-2"></loading-square>
      </div>
      <div v-if="showIssueErrorState" class="text-sm text-[#C96455] h-[220px]">資料載入失敗</div>
      <div v-else-if="showIssueEmptyState" class="text-text-muted h-[220px]">此分類無資料</div>
      <virtual-scroll
        v-else-if="isRunnerCompleted"
        :height="220"
        :items-length="completedIssueRows.length"
        :row-height="22"
      >
        <template v-slot="{ endIndex, startIndex }">
          <ul class="flex flex-col gap-2 mt-2">
            <site-audit-issue-row
              v-for="item in completedIssueRows.slice(startIndex, endIndex)"
              :key="item.key"
              :affected-urls="item.affectedUrls"
              :category-label="item.categoryLabel"
              :message="item.message"
              :severity-label="item.severityLabel"
              :severity-type="item.severityType"
            />
          </ul>
        </template>
      </virtual-scroll>
      <transition-group v-else class="relative flex flex-col gap-2" name="issue" tag="ul">
        <site-audit-issue-row
          v-for="item in runningIssueRows.slice(0, 7)"
          :key="item.key"
          :affected-urls="item.affectedUrls"
          :category-label="item.categoryLabel"
          :message="item.message"
          :severity-label="item.severityLabel"
          :severity-type="item.severityType"
        />
      </transition-group>
    </common-card>
    <common-card class="grid gap-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3>URL 結構樹</h3>
        <div v-if="isRunnerCompleted && rootNodes.length" class="text-text-secondary text-[12px]">
          點擊有子節點的項目可展開
        </div>
      </div>
      <div v-if="!isRunnerCompleted" class="url-tree__placeholder">掃描完成後可查看 URL 結構樹</div>
      <div v-else-if="loadingPaths['/']" class="url-tree__placeholder url-tree__placeholder--loading">
        <div class="text-text-muted text-lg">Loading</div>
        <loading-square class="mt-1 ml-2"></loading-square>
      </div>
      <div v-else-if="showUrlTreeErrorState" class="url-tree__placeholder url-tree__placeholder--error">
        URL 結構樹載入失敗
      </div>
      <div v-else-if="showUrlTreeEmptyState" class="url-tree__placeholder">沒有 URL 結構資料</div>
      <site-audit-url-tree-branch
        v-else
        :error-paths="errorPaths"
        :expanded-paths="expandedPaths"
        :loading-paths="loadingPaths"
        :tree-map="urlTree"
        @toggle="toggleUrlNode"
      />
    </common-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from '@nuxtjs/composition-api';
import useRunner from '~/pages/site-audit/useRunner';
import { categoryOptions, customColors, formatCircleProgress, severityOptions } from '~/pages/site-audit/constants';
import LoadingSquare from '~/components/common/LoadingSquare.vue';
import SiteAuditIssueRow from '~/components/site-audit/IssueRow.vue';
import useReport from '~/pages/site-audit/useReport';
import useIssues from '~/pages/site-audit/useIssues';
import useUrlTree from '~/pages/site-audit/useUrlTree';
import VirtualScroll from '~/components/common/VirtualScroll.vue';
import SiteAuditUrlTreeBranch from '~/components/site-audit/UrlTreeBranch.vue';

const {
  auditId,
  progress,
  linerProgressStatus,
  passedTime,
  timeLeft,
  percentage,
  isRunnerCompleted,
  page,
  runningIssueRows,
} = useRunner();

const { report, fetchReport } = useReport(auditId);
const activeCategory = ref('all');
const activeSeverity = ref('all');

const { showIssueErrorState, showIssueEmptyState, fetchIssues, completedIssueRows } = useIssues(
  auditId,
  activeCategory,
  activeSeverity,
  isRunnerCompleted,
);
const {
  urlTree,
  expandedPaths,
  loadingPaths,
  errorPaths,
  showUrlTreeEmptyState,
  showUrlTreeErrorState,
  loadTreePath,
  toggleUrlNode,
  rootNodes,
} = useUrlTree(auditId, isRunnerCompleted);

watch(isRunnerCompleted, () => {
  if (isRunnerCompleted.value) {
    fetchReport();
    fetchIssues();
    loadTreePath('/');
  }
});

watch([activeCategory, activeSeverity], () => {
  fetchIssues();
});

const summary = computed(() => {
  let result: Record<string, number | string> = {
    errors: '-',
    warnings: '-',
    notices: '-',
  };

  if (report.value) {
    result = report.value.summary;
  } else if (progress.value.errors && progress.value.warnings) {
    result = {
      errors: progress.value.errors,
      warnings: progress.value.warnings,
      notices: '-',
    };
  }

  return [
    {
      name: '錯誤',
      data: result.errors,
      color: '#C96455',
    },
    {
      name: '警告',
      data: result.warnings,
      color: '#D89A52',
    },
    {
      name: '提示',
      data: result.notices,
      color: '#8E9BA8',
    },
  ];
});
</script>
<style lang="scss" scoped>
::v-deep(.health-score .el-progress--circle .el-progress__text) {
  font-size: 28px !important;
}

.health-score__placeholder {
  width: 100px;
  height: 100px;
  border: 8px solid #e8dfdb;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6f5c54;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f1918;
}

.issue {
  &-enter-active,
  &-leave-active {
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  &-move {
    transition: transform 0.25s ease;
  }

  &-enter {
    opacity: 0;
    transform: translateY(-10px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  &-leave-active {
    position: absolute;
    left: 0;
    right: 0;
  }
}

.url-tree {
  &__placeholder {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8e7e76;
    text-align: center;
    border: 1px dashed #e8dfdb;
    border-radius: 16px;
    background: #fffaf8;

    &--loading {
      gap: 12px;
    }

    &--error {
      color: #c96455;
    }
  }
}
</style>
