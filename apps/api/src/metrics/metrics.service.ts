import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestsTotal: Counter;
  readonly httpRequestDuration: Histogram;
  readonly activeWebsocketConnections: Gauge;
  readonly conversationsTotal: Counter;
  readonly messagesTotal: Counter;
  readonly checkinsTotal: Counter;

  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.activeWebsocketConnections = new Gauge({
      name: 'active_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.conversationsTotal = new Counter({
      name: 'conversations_total',
      help: 'Total number of conversations created',
      registers: [this.registry],
    });

    this.messagesTotal = new Counter({
      name: 'messages_total',
      help: 'Total number of messages sent',
      labelNames: ['role'],
      registers: [this.registry],
    });

    this.checkinsTotal = new Counter({
      name: 'checkins_total',
      help: 'Total number of check-ins submitted',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
