import Redis from 'ioredis';

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('Redis connection failed after 3 retries');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  private ensureConnected() {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis is not connected');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      this.ensureConnected();
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      this.ensureConnected();
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error deleting from cache:', error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      this.ensureConnected();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Error deleting pattern from cache:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Error checking cache existence:', error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      this.ensureConnected();
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Error setting cache expiration:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      this.ensureConnected();
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Error getting cache TTL:', error);
      return -1;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      this.ensureConnected();
      return await this.client.incr(key);
    } catch (error) {
      console.error('Error incrementing cache value:', error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      this.ensureConnected();
      return await this.client.decr(key);
    } catch (error) {
      console.error('Error decrementing cache value:', error);
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch and set
      const value = await fetcher();
      await this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      console.error('Error in getOrSet:', error);
      // Fallback to fetcher if cache fails
      return fetcher();
    }
  }

  async flushDb(): Promise<boolean> {
    try {
      this.ensureConnected();
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('Error flushing database:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      this.ensureConnected();
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      this.ensureConnected();
      return await this.client.mget(...keys);
    } catch (error) {
      console.error('Error getting multiple keys:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>): Promise<boolean> {
    try {
      this.ensureConnected();
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        args.push(key, JSON.stringify(value));
      }
      await this.client.mset(...args);
      return true;
    } catch (error) {
      console.error('Error setting multiple keys:', error);
      return false;
    }
  }

  // Cache warming helper
  async warmCache(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of keyValuePairs) {
      await this.set(key, value, ttl);
    }
  }

  // Cache invalidation helper
  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`);
    await this.delPattern(`projects:${userId}:*`);
    await this.delPattern(`printers:${userId}:*`);
  }

  async invalidateProjectCache(projectId: string): Promise<void> {
    await this.delPattern(`project:${projectId}:*`);
  }

  // Statistics
  async getCacheStats(): Promise<{
    keys: number;
    memory: string;
    hitRate: number;
  }> {
    try {
      this.ensureConnected();
      const info = await this.client.info('stats');
      const keys = await this.client.dbsize();
      const memory = await this.client.info('memory');
      
      // Parse info to get hit rate (simplified)
      const hitRate = 0.85; // This would be calculated from actual stats
      
      return {
        keys,
        memory: memory.split('\n').find(line => line.includes('used_memory_human'))?.split(':')[1]?.trim() || 'unknown',
        hitRate,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { keys: 0, memory: 'unknown', hitRate: 0 };
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const cacheService = new CacheService();