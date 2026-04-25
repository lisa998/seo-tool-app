import { Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { AuditIssue } from '~/pages/site-audit/useIssues';

export type ExportFormat = 'csv' | 'json';

interface ExportJsonResp {
  issues: AuditIssue[];
}

type ExportResp = string | ExportJsonResp;

export default function (auditId: Ref<string>) {
  const exportData = ref<ExportResp | null>(null);
  const exportLoading = ref(false);
  const exportError = ref<unknown | null>(null);

  const { $axios } = useContext();

  const fetchExport = (format: ExportFormat = 'csv') =>
    withLoading(
      exportLoading,
      async () => {
        const response = await $axios.get<ExportResp>(`/api/audit/export/${auditId.value}`, {
          params: { format },
          responseType: format === 'csv' ? 'text' : 'json',
        });
        exportData.value = response.data;
      },
      exportError,
    );

  return {
    exportData,
    exportLoading,
    exportError,
    fetchExport,
  };
}
