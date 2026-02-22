import { Test, TestingModule } from '@nestjs/testing';
import { CacheService, CACHE_TTL } from './cache.service';
import { RedisService } from '../redis/redis.service';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CACHE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.sessions).toBe(3600);
      expect(CACHE_TTL.conversations).toBe(300);
      expect(CACHE_TTL.checkins).toBe(600);
      expect(CACHE_TTL.user).toBe(1800);
    });
  });

  describe('cacheGet', () => {
    it('should return cached value when available', async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify({ name: 'test' }));
      const fetcher = jest.fn();

      const result = await service.cacheGet('key', fetcher, 300);

      expect(result).toEqual({ name: 'test' });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should call fetcher and cache result when no cache hit', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue({ name: 'fresh' });

      const result = await service.cacheGet('key', fetcher, 300);

      expect(result).toEqual({ name: 'fresh' });
      expect(fetcher).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalledWith('key', JSON.stringify({ name: 'fresh' }), 300);
    });

    it('should call fetcher when cache read fails', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis down'));
      const fetcher = jest.fn().mockResolvedValue({ name: 'fallback' });

      const result = await service.cacheGet('key', fetcher, 300);

      expect(result).toEqual({ name: 'fallback' });
      expect(fetcher).toHaveBeenCalled();
    });

    it('should still return result even if cache write fails', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockRejectedValue(new Error('Redis down'));
      const fetcher = jest.fn().mockResolvedValue({ name: 'data' });

      const result = await service.cacheGet('key', fetcher, 300);

      expect(result).toEqual({ name: 'data' });
    });
  });

  describe('cacheInvalidate', () => {
    it('should delete cache key', async () => {
      mockRedisService.del.mockResolvedValue(undefined);
      await service.cacheInvalidate('some-key');
      expect(mockRedisService.del).toHaveBeenCalledWith('some-key');
    });

    it('should not throw on error', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis down'));
      await expect(service.cacheInvalidate('some-key')).resolves.toBeUndefined();
    });
  });
});
