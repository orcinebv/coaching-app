import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface AiCallOptions {
  service: string;
  userId: string;
  payload: Record<string, any>;
  cacheKey?: string | null;
  cacheTtl?: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly webhookBaseUrl: string;
  private readonly maxRetries = 2;
  private readonly timeoutMs = 15000;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.webhookBaseUrl = this.config.get<string>('N8N_WEBHOOK_URL', 'http://n8n:5678');
  }

  async call(opts: AiCallOptions): Promise<{ data: any; cached: boolean; fallback: boolean }> {
    const start = Date.now();

    if (opts.cacheKey) {
      const cached = await this.redis.get(opts.cacheKey);
      if (cached) {
        this.trackUsage(opts.userId, opts.service, 0, 0, Date.now() - start, true, false);
        return { data: JSON.parse(cached), cached: true, fallback: false };
      }
    }

    const url = `${this.webhookBaseUrl}/webhook/${opts.service}`;
    let result: any = null;
    let hadError = false;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), this.timeoutMs);
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: opts.userId, ...opts.payload }),
          signal: controller.signal,
        });
        clearTimeout(t);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        result = await resp.json();
        break;
      } catch (err) {
        this.logger.warn(`AI call failed attempt ${attempt}: ${err}`);
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        } else {
          hadError = true;
        }
      }
    }

    const responseMs = Date.now() - start;
    const tokens = result?.tokensUsed ?? 0;
    this.trackUsage(opts.userId, opts.service, tokens, tokens * 0.000002, responseMs, false, hadError || !result);

    if (hadError || !result) {
      return { data: null, cached: false, fallback: true };
    }

    if (opts.cacheKey && opts.cacheTtl) {
      await this.redis.set(opts.cacheKey, JSON.stringify(result), opts.cacheTtl);
    }

    return { data: result, cached: false, fallback: false };
  }

  private trackUsage(
    userId: string,
    service: string,
    tokensUsed: number,
    costEur: number,
    responseMs: number,
    cached: boolean,
    error: boolean,
  ): void {
    this.prisma.aiUsage
      .create({ data: { userId, service, tokensUsed, costEur, responseMs, cached, error } })
      .catch(err => this.logger.error(`Usage tracking failed: ${err}`));
  }

  async getUsageStats(userId: string) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [monthly, errorCount] = await Promise.all([
      this.prisma.aiUsage.aggregate({
        where: { userId, createdAt: { gte: monthStart }, error: false },
        _sum: { tokensUsed: true, costEur: true },
        _count: true,
      }),
      this.prisma.aiUsage.count({
        where: { userId, error: true, createdAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);

    return {
      monthlyTokens: monthly._sum.tokensUsed ?? 0,
      monthlyCostEur: Math.round((monthly._sum.costEur ?? 0) * 100) / 100,
      totalRequests: monthly._count,
      errorsLast24h: errorCount,
    };
  }
}
