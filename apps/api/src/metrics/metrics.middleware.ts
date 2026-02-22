import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationNs = Number(process.hrtime.bigint() - start);
      const durationSeconds = durationNs / 1e9;
      const path = req.route?.path || req.path;

      this.metricsService.httpRequestsTotal.inc({
        method: req.method,
        path,
        status: res.statusCode.toString(),
      });

      this.metricsService.httpRequestDuration.observe(
        { method: req.method, path, status: res.statusCode.toString() },
        durationSeconds,
      );
    });

    next();
  }
}
