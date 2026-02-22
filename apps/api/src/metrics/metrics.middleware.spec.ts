import { MetricsMiddleware } from './metrics.middleware';
import { MetricsService } from './metrics.service';

describe('MetricsMiddleware', () => {
  let middleware: MetricsMiddleware;
  let mockMetricsService: Partial<MetricsService>;

  beforeEach(() => {
    mockMetricsService = {
      httpRequestsTotal: { inc: jest.fn() } as any,
      httpRequestDuration: { observe: jest.fn() } as any,
    };
    middleware = new MetricsMiddleware(mockMetricsService as MetricsService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next', () => {
    const req = { method: 'GET', path: '/test' } as any;
    const res = { on: jest.fn(), statusCode: 200 } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should record metrics on response finish', () => {
    const req = { method: 'GET', path: '/test' } as any;
    let finishCallback: (() => void) | undefined;
    const res = {
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb;
      }),
      statusCode: 200,
    } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(finishCallback).toBeDefined();
    finishCallback!();

    expect(mockMetricsService.httpRequestsTotal!.inc).toHaveBeenCalledWith({
      method: 'GET',
      path: '/test',
      status: '200',
    });
    expect(mockMetricsService.httpRequestDuration!.observe).toHaveBeenCalledWith(
      { method: 'GET', path: '/test', status: '200' },
      expect.any(Number),
    );
  });
});
