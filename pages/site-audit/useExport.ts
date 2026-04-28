import { Ref, ref } from '@nuxtjs/composition-api';
import { AuditIssue } from '~/pages/site-audit/useIssues';
import downloadBlob from '~/utils/downloadBlob';

export type ExportFormat = 'csv' | 'json';

interface ExportJsonResp {
  issues: AuditIssue[];
}

type ExportResp = string | ExportJsonResp;

export default function (auditId: Ref<string>) {
  const exportLoading = ref(false);
  const exportError = ref<unknown | null>(null);

  const fetchExport = async (format: ExportFormat = 'csv') => {
    exportLoading.value = true;
    exportError.value = null;
    try {
      const resp = await fetch(`/api/audit/export/${auditId.value}?format=${format}`, {
        method: 'GET',
        headers: { Authorization: `Bearer token-1234567890` },
      });
      if (!resp.ok) {
        throw new Error(`Export failed: ${resp.status}`);
      }
      if (!resp.body) {
        throw new Error('Response body is empty or ReadableStream is not supported.');
      }
      const reader = resp.body.getReader();
      const chunk = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunk.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      const blob = new Blob(chunk, {
        type: 'text/csv;charset=utf-8',
      });
      downloadBlob(blob, `audit-${auditId.value}.${format}`);
    } catch (error) {
      exportError.value = error;
    } finally {
      exportLoading.value = false;
    }
  };

  return {
    exportLoading,
    exportError,
    fetchExport,
  };
}
