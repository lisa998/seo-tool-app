// TODO: implement
// mocks/utils/pagination.ts

export interface CursorPayload {
  id: string;
  sortValue?: number | string;
}

/**
 * 將 cursor payload 編碼為 base64 字串
 */
export function encodeCursor(payload: CursorPayload): string {
  return btoa(JSON.stringify(payload));
}

/**
 * 解碼 cursor 字串
 */
export function decodeCursor(cursor: string): CursorPayload {
  try {
    return JSON.parse(atob(cursor));
  } catch {
    return { id: '' };
  }
}

/**
 * 通用的 cursor-based 分頁函式
 * @param items 完整資料陣列（已排序 + 已篩選）
 * @param cursor 前端傳的 cursor（可為 null）
 * @param limit 每頁筆數
 * @param getId 取得 item id 的函式
 * @returns { page, nextCursor, hasMore, total }
 */
export function paginateWithCursor<T>(
  items: T[],
  cursor: string | null,
  limit: number,
  getId: (item: T) => string,
): {
  page: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
} {
  let startIndex = 0;

  if (cursor) {
    const { id } = decodeCursor(cursor);
    const idx = items.findIndex((item) => getId(item) === id);
    startIndex = idx >= 0 ? idx + 1 : 0;
  }

  const page = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < items.length;
  const nextCursor = hasMore ? encodeCursor({ id: getId(page[page.length - 1]) }) : null;

  return { page, nextCursor, hasMore, total: items.length };
}

/**
 * 通用排序函式
 * @param items 資料陣列
 * @param sortStr 排序字串，如 'dr_desc', 'traffic_asc'
 * @param fieldMap 欄位名映射 { dr: 'sourceDR', traffic: 'traffic' }
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortStr: string,
  fieldMap: Record<string, keyof T>,
): T[] {
  const parts = sortStr.split('_');
  const order = parts.pop() as 'asc' | 'desc';
  const field = parts.join('_');
  const mappedField = fieldMap[field];

  if (!mappedField) return items;

  const sorted = [...items];
  sorted.sort((a, b) => {
    const va = a[mappedField];
    const vb = b[mappedField];
    if (typeof va === 'number' && typeof vb === 'number') {
      return order === 'desc' ? vb - va : va - vb;
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      return order === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
    }
    return 0;
  });
  return sorted;
}

/**
 * 從 URL 取得查詢參數的便利函式
 */
export function getParam(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

export function getIntParam(url: URL, key: string, defaultVal: number): number {
  const v = url.searchParams.get(key);
  return v ? parseInt(v, 10) : defaultVal;
}
