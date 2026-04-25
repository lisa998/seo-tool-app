<template>
  <ul :class="{ 'url-tree-branch--nested': level > 0 }" class="url-tree-branch">
    <li v-for="node in treeMap[rootPath]" :key="node.fullPath">
      <site-audit-tree-item
        :expanded="isExpanded(node.fullPath)"
        :has-children="node.hasChildren"
        :loading="isLoading(node.fullPath)"
        @toggle="$emit('toggle', node)"
      >
        <div class="url-tree-node">
          <div class="url-tree-node__main">
            <div class="url-tree-node__heading">
              <span :class="`url-tree-node__type--${node.type}`" class="url-tree-node__type">
                {{ node.type === 'directory' ? '資料夾' : '頁面' }}
              </span>
              <span class="url-tree-node__segment">{{ node.segment }}</span>
            </div>
            <div class="url-tree-node__path">{{ node.fullPath }}</div>
          </div>
          <div class="url-tree-node__stats">
            <span class="url-tree-node__metric">頁面 {{ node.pageCount }}</span>
            <span class="url-tree-node__metric url-tree-node__metric--error">錯誤 {{ node.errorCount }}</span>
            <span class="url-tree-node__metric url-tree-node__metric--warning">警告 {{ node.warningCount }}</span>
          </div>
        </div>
        <template #children>
          <site-audit-url-tree-branch
            v-if="isExpanded(node.fullPath) && getChildren(node.fullPath).length"
            :error-paths="errorPaths"
            :expanded-paths="expandedPaths"
            :level="level + 1"
            :loading-paths="loadingPaths"
            :root-path="node.fullPath"
            :tree-map="treeMap"
            @toggle="$emit('toggle', $event)"
          />
          <div
            v-else-if="isExpanded(node.fullPath) && isError(node.fullPath)"
            class="url-tree-node__status url-tree-node__status--error"
          >
            載入失敗，再點一次可重試。
          </div>
          <div v-else-if="isExpanded(node.fullPath) && !isLoading(node.fullPath)" class="url-tree-node__status">
            沒有更多子節點
          </div>
        </template>
      </site-audit-tree-item>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import SiteAuditTreeItem from '~/components/site-audit/TreeItem.vue';
import type { UrlNodeStatus, UrlTreeNode } from '~/pages/site-audit/useUrlTree';
import { PropType } from '@nuxtjs/composition-api';

const props = defineProps({
  treeMap: {
    type: Object as PropType<Record<string, UrlTreeNode[]>>,
    required: true,
  },
  expandedPaths: {
    type: Object as PropType<UrlNodeStatus>,
    required: true,
  },
  loadingPaths: {
    type: Object as PropType<UrlNodeStatus>,
    required: true,
  },
  errorPaths: {
    type: Object as PropType<UrlNodeStatus>,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  rootPath: {
    type: String,
    default: '/',
  },
});

const getChildren = (path: string) => {
  return props.treeMap[path] ?? [];
};
const isExpanded = (path: string) => {
  return !!props.expandedPaths[path];
};
const isLoading = (path: string) => {
  return !!props.loadingPaths[path];
};
const isError = (path: string) => {
  return !!props.errorPaths[path];
};
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
}

.url-tree-branch {
  display: grid;
  gap: 12px;

  &--nested {
    margin-top: 10px;
    margin-left: 8px;
    padding-left: 16px;
    border-left: 1px solid #eadfda;
  }
}

.url-tree-node {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;

  &__main {
    min-width: 0;
    flex: 1;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__type {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 9999px;
    font-size: 12px;
    line-height: 1;
    font-weight: 600;

    &--directory {
      color: #6f5c54;
      background: #efe4dd;
    }

    &--page {
      color: #56718a;
      background: #e3edf5;
    }
  }

  &__segment {
    font-size: 15px;
    font-weight: 600;
    color: #1f1918;
    word-break: break-word;
  }

  &__path {
    margin-top: 6px;
    color: #8e7e76;
    font-size: 13px;
    line-height: 1.4;
    word-break: break-all;
  }

  &__stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__metric {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 9999px;
    background: #f4ece8;
    color: #6f5c54;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;

    &--error {
      background: rgba(201, 100, 85, 0.12);
      color: #c96455;
    }

    &--warning {
      background: rgba(216, 154, 82, 0.16);
      color: #d89a52;
    }
  }

  &__status {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #faf5f2;
    color: #8e7e76;
    font-size: 13px;

    &--error {
      color: #c96455;
      background: rgba(201, 100, 85, 0.08);
    }
  }
}

@media (max-width: 768px) {
  .url-tree-node {
    flex-direction: column;
  }

  .url-tree-node__stats {
    justify-content: flex-start;
  }
}
</style>
