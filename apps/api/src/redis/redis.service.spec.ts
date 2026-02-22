import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock ioredis completely
jest.mock('ioredis', () => {
  const mRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    quit: jest.fn(),
    on: jest.fn().mockReturnThis(),
    connect: jest.fn().mockResolvedValue(undefined),
  };
  return { default: jest.fn(() => mRedis), __esModule: true };
});

import Redis from 'ioredis';

const mockConfigService = {
  get: jest.fn().mockReturnValue('redis://localhost:6379'),
};

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisInstance: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    mockRedisInstance = (Redis as unknown as jest.Mock).mock.results[0]?.value;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      mockRedisInstance.get.mockResolvedValue('cached-value');
      const result = await service.get('test-key');
      expect(result).toBe('cached-value');
      expect(mockRedisInstance.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedisInstance.get.mockResolvedValue(null);
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockRedisInstance.get.mockRejectedValue(new Error('Connection lost'));
      const result = await service.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set a value without TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      await service.set('key', 'value');
      expect(mockRedisInstance.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should set a value with TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      await service.set('key', 'value', 300);
      expect(mockRedisInstance.set).toHaveBeenCalledWith('key', 'value', 'EX', 300);
    });

    it('should not throw on error', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('Connection lost'));
      await expect(service.set('key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      mockRedisInstance.del.mockResolvedValue(1);
      await service.del('key');
      expect(mockRedisInstance.del).toHaveBeenCalledWith('key');
    });

    it('should not throw on error', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('Connection lost'));
      await expect(service.del('key')).resolves.toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisInstance.exists.mockResolvedValue(1);
      const result = await service.exists('key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisInstance.exists.mockResolvedValue(0);
      const result = await service.exists('key');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockRedisInstance.exists.mockRejectedValue(new Error('Connection lost'));
      const result = await service.exists('key');
      expect(result).toBe(false);
    });
  });

  describe('setWithTTL', () => {
    it('should call set with TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      await service.setWithTTL('key', 'value', 600);
      expect(mockRedisInstance.set).toHaveBeenCalledWith('key', 'value', 'EX', 600);
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis connection', async () => {
      mockRedisInstance.quit.mockResolvedValue('OK');
      await service.onModuleDestroy();
      expect(mockRedisInstance.quit).toHaveBeenCalled();
    });
  });
});
