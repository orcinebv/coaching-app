import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      this.client.connect().catch((err) => {
        this.logger.warn(
          `Redis unavailable, running without cache: ${err.message}`,
        );
        this.client = null;
      });
    } catch (err) {
      this.logger.warn(
        `Failed to initialize Redis: ${(err as Error).message}`,
      );
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.client) return null;
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`Redis GET error for key ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (!this.client) return;
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn(`Redis SET error for key ${key}: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) return;
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Redis DEL error for key ${key}: ${(err as Error).message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      this.logger.warn(`Redis EXISTS error for key ${key}: ${(err as Error).message}`);
      return false;
    }
  }

  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    return this.set(key, value, ttl);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
