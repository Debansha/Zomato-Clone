/**
 * @module config/redis
 * @description Redis client using ioredis with reconnection strategy and graceful degradation.
 * If Redis is unavailable the app continues to run — cache operations will simply be skipped.
 */

const Redis = require('ioredis');
const config = require('./env');

/** @type {boolean} Tracks whether Redis is currently available */
let isRedisAvailable = false;

/**
 * Creates and configures the ioredis client.
 * @returns {Redis} Configured Redis instance.
 */
const createRedisClient = () => {
  const client = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    // Reconnection back-off: attempt × 200 ms, capped at 5 s
    retryStrategy(times) {
      if (times > 10) {
        console.warn('🟡  Redis: max reconnection attempts reached — giving up');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 5000);
    },
    lazyConnect: false,
    enableReadyCheck: true,
  });

  // -----------------------------------------------------------------------
  // Event listeners
  // -----------------------------------------------------------------------

  client.on('connect', () => {
    console.log('📡  Redis client connecting...');
  });

  client.on('ready', () => {
    isRedisAvailable = true;
    console.log('✅  Redis connected and ready');
  });

  client.on('error', (err) => {
    isRedisAvailable = false;
    console.error(`🔴  Redis error: ${err.message}`);
  });

  client.on('close', () => {
    isRedisAvailable = false;
    console.warn('🟡  Redis connection closed');
  });

  client.on('reconnecting', (delay) => {
    console.log(`⏳  Redis reconnecting in ${delay}ms...`);
  });

  client.on('end', () => {
    isRedisAvailable = false;
    console.warn('🟡  Redis connection ended');
  });

  return client;
};

const redis = createRedisClient();

/**
 * Returns whether the Redis connection is currently usable.
 * Use this before performing cache operations to avoid unhandled errors.
 * @returns {boolean}
 */
const getRedisStatus = () => isRedisAvailable;

module.exports = { redis, getRedisStatus };
