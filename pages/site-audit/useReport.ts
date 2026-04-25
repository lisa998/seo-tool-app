import { ref, Ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

interface ReportResp {
  auditId: string;
  domain: string;
  completedAt: string;
  healthScore: number;
  summary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  categories: {
    name: string;
    errors: number;
    warnings: number;
    notices: number;
  }[];
}

export default function (auditId: Ref<string>) {
  const { $axios } = useContext();

  const report = ref<ReportResp | null>(null);
  const reportLoading = ref(false);
  const reportError = ref<string | null>(null);

  const fetchReport = () =>
    withLoading(
      reportLoading,
      async () => {
        report.value = await $axios.$get(`/api/audit/report/${auditId.value}`);
      },
      reportError,
    );

  return {
    report,
    fetchReport,
    reportLoading,
    reportError,
  };
}
