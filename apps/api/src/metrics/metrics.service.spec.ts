import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have registry', () => {
    expect(service.registry).toBeDefined();
  });

  it('should have httpRequestsTotal counter', () => {
    expect(service.httpRequestsTotal).toBeDefined();
  });

  it('should have httpRequestDuration histogram', () => {
    expect(service.httpRequestDuration).toBeDefined();
  });

  it('should have activeWebsocketConnections gauge', () => {
    expect(service.activeWebsocketConnections).toBeDefined();
  });

  it('should have conversationsTotal counter', () => {
    expect(service.conversationsTotal).toBeDefined();
  });

  it('should have messagesTotal counter', () => {
    expect(service.messagesTotal).toBeDefined();
  });

  it('should have checkinsTotal counter', () => {
    expect(service.checkinsTotal).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should collect default metrics', () => {
      service.onModuleInit();
      // After init, getMetrics should return default node.js metrics
    });
  });

  describe('getMetrics', () => {
    it('should return metrics string', async () => {
      service.onModuleInit();
      const metrics = await service.getMetrics();
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('http_requests_total');
    });

    it('should include counter after increment', async () => {
      service.httpRequestsTotal.inc({ method: 'GET', path: '/test', status: '200' });
      const metrics = await service.getMetrics();
      expect(metrics).toContain('http_requests_total');
    });
  });
});
