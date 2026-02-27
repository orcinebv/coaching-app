import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './cache/cache.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { CheckInsModule } from './checkins/checkins.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthModule } from './health/health.module';
import { N8nModule } from './n8n/n8n.module';
import { NotificationModule } from './notification/notification.module';
import { GoalsModule } from './goals/goals.module';
import { JournalModule } from './journal/journal.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { AiModule } from './ai/ai.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { CoachingPromptsModule } from './coaching-prompts/coaching-prompts.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { InsightsModule } from './insights/insights.module';
import { AdminModule } from './admin/admin.module';
import { CoachModule } from './coach/coach.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', path.resolve(__dirname, '../../../../.env')],
    }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 1000 }] }),
    PrismaModule,
    RedisModule,
    CacheModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    CheckInsModule,
    WebhooksModule,
    HealthModule,
    N8nModule,
    NotificationModule,
    GoalsModule,
    JournalModule,
    ExercisesModule,
    AnalyticsModule,
    ReportsModule,
    AiModule,
    SentimentModule,
    CoachingPromptsModule,
    RecommendationsModule,
    InsightsModule,
    AdminModule,
    CoachModule,
    OrganizationsModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
