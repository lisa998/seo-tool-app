import { Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

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

  const { loading: reportLoading, error: reportError, data: report, execute } = useRequestState<ReportResp>(null);

  const fetchReport = () => execute(() => $axios.$get(`/api/audit/report/${auditId.value}`));

  return {
    report,
    fetchReport,
    reportLoading,
    reportError,
  };
}
