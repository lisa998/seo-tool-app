import { computed, onBeforeUnmount, onMounted, ref, useContext } from '@nuxtjs/composition-api';
import { formatTimeDuration } from '~/utils/formatDate';
import { issueCategoryMap, issueTagMap, issueTypeMap, progressStatusMap } from '~/pages/site-audit/constants';
import { IssueRow } from '~/pages/site-audit/useIssues';

interface Progress {
  pagesScanned: number;
  totalPages: number;
  speed: number;
  errors: number;
  warnings: number;
  auditId?: number;
  totalErrors?: number;
  totalWarnings?: number;
  healthScore?: number;
}

const Category = ['seo', 'performance', 'links', 'content', 'indexability'] as const;
const Rule = ['missing_h1', 'missing_meta', 'slow_page', 'broken_link', 'thin_content', 'large_image'] as const;
export type CategoryType = (typeof Category)[number];
export type RuleType = (typeof Rule)[number];

interface Issue {
  type: 'error' | 'warning';
  category: CategoryType;
  rule: RuleType;
  url: string;
  message: string;
}

type Status = 'idle' | 'connected' | 'reconnecting' | 'error' | 'completed';

export default function () {
  const { $axios } = useContext();

  const status = ref<Status>('idle');
  const progress = ref<Progress>({} as Progress);
  const issues = ref<Issue[]>([]);
  const auditId = ref<string>('');
  let es: EventSource | null = null;
  let timer: NodeJS.Timeout | undefined;

  // 直接 mock 了，實際上應該是自行搜尋 domain 後拿到 auditId，再開啟 EventSource
  onMounted(async () => {
    const resp = await $axios.$post('/api/audit/start', {
      domain: 'example.com',
      maxPages: 800,
    });
    auditId.value = resp.auditId;
    es = new EventSource(resp.streamUrl);

    es.onopen = () => {
      status.value = 'connected';
    };
    es.onerror = () => {
      if (es?.readyState === EventSource.CONNECTING) {
        status.value = 'reconnecting';
      } else {
        status.value = 'error';
      }
    };
    es.addEventListener('progress', (e) => {
      progress.value = { ...progress.value, ...JSON.parse(e.data) };
    });
    es.addEventListener('issue_found', (e) => {
      issues.value.unshift(JSON.parse(e.data));
    });
    es.addEventListener('complete', (e) => {
      progress.value = { ...progress.value, ...JSON.parse(e.data) };
      status.value = 'completed';
      es?.close();
      clearInterval(timer);
    });
  });

  const linerProgressStatus = computed(() => progressStatusMap[status.value]);

  const startTime = Date.now();
  const passedTime = ref('00:00:00');
  timer = setInterval(() => {
    const currentTime = Date.now();
    passedTime.value = formatTimeDuration(currentTime - startTime, 'milliseconds');
  }, 1000);

  const timeLeft = computed(() => {
    const { pagesScanned, totalPages, speed } = progress.value;
    if (!pagesScanned || !totalPages || !speed) return '掃描中...';
    const remainingPages = totalPages - pagesScanned;
    const leftSeconds = Math.floor(remainingPages / speed);
    return formatTimeDuration(leftSeconds);
  });

  const percentage = computed(() => {
    if (!progress.value.totalPages) return 0;
    return Math.floor((progress.value.pagesScanned / progress.value.totalPages) * 100);
  });

  const page = computed(() => {
    const { pagesScanned, totalPages } = progress.value;
    if (!pagesScanned || !totalPages) return '0 / 0';
    return `${pagesScanned} / ${totalPages}`;
  });

  const isRunnerCompleted = computed(() => status.value === 'completed');

  const runningIssueRows = computed<IssueRow[]>(() =>
    (issues.value ?? []).map((item) => ({
      key: `${item.category}-${item.rule}-${item.url}`,
      categoryLabel: issueCategoryMap[item.category],
      severityLabel: item.type,
      severityType: issueTagMap[item.type],
      message: issueTypeMap[item.rule],
      affectedUrls: '',
    })),
  );

  onBeforeUnmount(() => {
    es?.close();
    clearInterval(timer);
  });

  return {
    status,
    progress,
    issues,
    linerProgressStatus,
    passedTime,
    timeLeft,
    percentage,
    isRunnerCompleted,
    auditId,
    page,
    runningIssueRows,
  };
}
