import dayjs from 'dayjs';
import duration, { DurationUnitType } from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function formatYearMonth(date: string | Date) {
  return dayjs(date).format('YYYY-MM');
}

// format to hh:mm:ss
export function formatTime(date: string | Date) {
  return dayjs(date).format('HH:mm:ss');
}

export function formatTimeDuration(timeNumber: number, unit: DurationUnitType = 'seconds') {
  return dayjs.duration(timeNumber, unit).format('HH:mm:ss');
}
