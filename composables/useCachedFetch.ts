const cache = new Map<string, { data: unknown; timestamp: number }>();

export const executeCache = async <T>(key: string, fetcher: () => Promise<T>, ttlMs = 150000) => {
  const cached = cache.get(key);
  const isExpired = cached && Date.now() - cached.timestamp > ttlMs;

  if (!cached || isExpired) {
    const result = await fetcher();
    cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } else {
    return cached.data as T;
  }
};

export const clearAllCache = () => {
  cache.clear();
};
