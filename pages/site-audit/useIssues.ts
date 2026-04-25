import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { issueTagMap } from '~/pages/site-audit/constants';

export interface AuditIssue {
  id: string;
  rule: string;
  severity: 'error' | 'warning' | 'notice';
  category: 'seo' | 'performance' | 'links' | 'content' | 'indexability';
  message: string;
  affectedUrls: number;
  exampleUrl: string;
}

interface IssueResp {
  data: AuditIssue[];
  facets: { category: Record<string, number>; severity: Record<string, number> };
  pagination: { cursor: string | null; hasMore: boolean; total: number };
}

export interface IssueRow {
  key: string;
  categoryLabel: string;
  severityLabel: string;
  severityType: string;
  message: string;
  affectedUrls: string;
}

export default function (
  auditId: Ref<string>,
  activeCategory: Ref<string>,
  activeSeverity: Ref<string>,
  isRunnerCompleted: Ref<boolean>,
) {
  const allIssues = ref<IssueResp>({} as IssueResp);
  const issuesLoading = ref(false);
  const issuesError = ref(null);

  const { $axios } = useContext();

  const fetchIssues = () =>
    withLoading(
      issuesLoading,
      async () => {
        allIssues.value = await $axios.$get(`/api/audit/issues/${auditId.value}`, {
          params: {
            category: activeCategory.value,
            severity: activeSeverity.value,
          },
        });
      },
      issuesError,
    );

  const completedIssueRows = computed<IssueRow[]>(() =>
    (allIssues.value?.data ?? []).map((item) => ({
      key: item.id,
      categoryLabel: item.category,
      severityLabel: item.severity,
      severityType: issueTagMap[item.severity],
      message: item.message,
      affectedUrls: String(item.affectedUrls),
    })),
  );

  const showIssueErrorState = computed(
    () => isRunnerCompleted.value && !issuesLoading.value && Boolean(issuesError.value),
  );
  const showIssueEmptyState = computed(
    () => isRunnerCompleted.value && !issuesLoading.value && completedIssueRows.value.length === 0,
  );

  return {
    allIssues,
    issuesLoading,
    issuesError,
    fetchIssues,
    completedIssueRows,
    showIssueErrorState,
    showIssueEmptyState,
  };
}
