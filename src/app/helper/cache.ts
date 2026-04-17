import redisClient from '../config/redis';

const DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Get from cache or fetch from source and store.
 * @param key       Redis key
 * @param ttl       Expiry in seconds (default 5 min)
 * @param fetchFn   Async function that returns fresh data
 */
export const getOrSet = async <T>(
  key: string,
  ttl: number = DEFAULT_TTL,
  fetchFn: () => Promise<T>,
): Promise<T> => {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const fresh = await fetchFn();
  await redisClient.set(key, JSON.stringify(fresh), { EX: ttl });
  return fresh;
};

/**
 * Delete one or more keys from Redis.
 */
export const invalidate = async (...keys: string[]): Promise<void> => {
  if (keys.length) await redisClient.del(keys);
};

/**
 * Delete all keys matching a pattern  (e.g. "blogs:*").
 * Uses SCAN so it is safe on production Redis (no KEYS command).
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  let cursor = '0';
  do {
    const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = reply.cursor;
    if (reply.keys.length) await redisClient.del(reply.keys);
  } while (cursor !== '0');
};