import redisClient from '../config/redis.js';

/**
 * Cache Service — Redis wrapper with graceful fallback.
 * If Redis is unavailable, the app continues without caching.
 */

let isConnected = false;

// Attempt to connect on import
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    isConnected = true;
    console.log('✓ Cache service ready (Redis)');
  } catch (error) {
    isConnected = false;
    console.warn('⚠ Redis unavailable — running without cache:', error.message);
  }
})();

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {any|null} Parsed JSON value, or null if not found / Redis down.
 */
export const cacheGet = async (key) => {
  if (!isConnected) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache GET error:', error.message);
    return null;
  }
};

/**
 * Set a cached value with TTL.
 * @param {string} key
 * @param {any} value — Will be JSON.stringify'd.
 * @param {number} ttl — Time-to-live in seconds.
 */
export const cacheSet = async (key, value, ttl) => {
  if (!isConnected) return;

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
  } catch (error) {
    console.error('Cache SET error:', error.message);
  }
};

/**
 * Delete a cached key.
 * @param {string} key
 */
export const cacheDel = async (key) => {
  if (!isConnected) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache DEL error:', error.message);
  }
};

/**
 * Delete all keys matching a pattern (e.g. "salons:*").
 * @param {string} pattern
 */
export const cacheDelPattern = async (pattern) => {
  if (!isConnected) return;

  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache DEL pattern error:', error.message);
  }
};
