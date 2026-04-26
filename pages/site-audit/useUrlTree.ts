import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

export interface UrlTreeNode {
  segment: string;
  fullPath: string;
  type: 'directory' | 'page';
  pageCount: number;
  errorCount: number;
  warningCount: number;
  hasChildren: boolean;
}

interface UrlTreeResp {
  path: string;
  children: UrlTreeNode[];
}

export type UrlNodeStatus = Record<string, boolean>;

export default function (auditId: Ref<string>, isRunnerCompleted: Ref<boolean>) {
  const urlTree = ref<Record<string, UrlTreeNode[]>>({});

  const { $axios } = useContext();
  const { loading: urlTreeLoading, error: urlTreeError, execute } = useRequestState();

  const fetchUrlTree = (path = '/') =>
    execute(async () => {
      const { path: currentPath, children } = await $axios.$get<UrlTreeResp>(`/api/audit/url-tree/${auditId.value}`, {
        params: { path },
      });
      urlTree.value = {
        ...urlTree.value,
        [currentPath]: children,
      };
    });

  const expandedPaths = ref<UrlNodeStatus>({});
  const loadingPaths = ref<UrlNodeStatus>({});
  const errorPaths = ref<UrlNodeStatus>({});

  const rootNodes = computed(() => urlTree.value['/'] ?? []);
  const showUrlTreeErrorState = computed(
    () => isRunnerCompleted.value && !loadingPaths.value['/'] && errorPaths.value['/'],
  );
  const showUrlTreeEmptyState = computed(
    () =>
      isRunnerCompleted.value &&
      !loadingPaths.value['/'] &&
      !showUrlTreeErrorState.value &&
      rootNodes.value.length === 0,
  );

  const updateStatusMap = (target: Ref<UrlNodeStatus>, path: string, value: boolean) => {
    target.value = {
      ...target.value,
      [path]: value,
    };
  };

  const loadTreePath = async (path = '/') => {
    if (!auditId.value || loadingPaths.value[path]) return;

    updateStatusMap(loadingPaths, path, true);
    updateStatusMap(errorPaths, path, false);

    await fetchUrlTree(path);

    updateStatusMap(loadingPaths, path, false);
    updateStatusMap(errorPaths, path, !!urlTreeError.value);
  };

  const toggleUrlNode = async (node: UrlTreeNode) => {
    if (!node.hasChildren) return;

    const isExpanded = expandedPaths.value[node.fullPath];
    updateStatusMap(expandedPaths, node.fullPath, !isExpanded);

    if (isExpanded) return;
    if (!urlTree.value[node.fullPath] || errorPaths.value[node.fullPath]) {
      await loadTreePath(node.fullPath);
    }
  };

  return {
    urlTree,
    urlTreeLoading,
    urlTreeError,
    fetchUrlTree,
    expandedPaths,
    loadingPaths,
    errorPaths,
    showUrlTreeEmptyState,
    showUrlTreeErrorState,
    loadTreePath,
    toggleUrlNode,
    rootNodes,
  };
}
