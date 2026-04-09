// formatYearMonth.ts
import dayjs from 'dayjs';

export function formatYearMonth(date: string | Date) {
  return dayjs(date).format('YYYY-MM');
}
