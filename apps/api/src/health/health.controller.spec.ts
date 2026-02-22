import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  $queryRawUnsafe: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return ok status when database is up', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.checks.database).toEqual({ status: 'up' });
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });

    it('should return degraded status when database is down', async () => {
      mockPrismaService.$queryRawUnsafe.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.database).toEqual({
        status: 'down',
        message: 'Connection refused',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockPrismaService.$queryRawUnsafe.mockRejectedValue('string error');

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.database).toEqual({
        status: 'down',
        message: 'Unknown error',
      });
    });

    it('should include timestamp and uptime in response', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });
  });
});
