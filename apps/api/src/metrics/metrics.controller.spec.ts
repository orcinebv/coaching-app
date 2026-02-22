import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

const mockMetricsService = {
  getMetrics: jest.fn(),
};

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return metrics from service', async () => {
      mockMetricsService.getMetrics.mockResolvedValue('# HELP http_requests_total\n');
      const result = await controller.getMetrics();
      expect(result).toBe('# HELP http_requests_total\n');
      expect(mockMetricsService.getMetrics).toHaveBeenCalled();
    });
  });
});
