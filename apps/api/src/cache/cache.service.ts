import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export const CACHE_TTL = {
  sessions: 3600,
  conversations: 300,
  checkins: 600,
  user: 1800,
} as const;

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async cacheGet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      this.logger.warn(
        `Cache read failed for key ${key}: ${(err as Error).message}`,
      );
    }

    const result = await fetcher();

    try {
      await this.redisService.set(key, JSON.stringify(result), ttl);
    } catch (err) {
      this.logger.warn(
        `Cache write failed for key ${key}: ${(err as Error).message}`,
      );
    }

    return result;
  }

  async cacheInvalidate(pattern: string): Promise<void> {
    try {
      await this.redisService.del(pattern);
    } catch (err) {
      this.logger.warn(
        `Cache invalidation failed for pattern ${pattern}: ${(err as Error).message}`,
      );
    }
  }
}
