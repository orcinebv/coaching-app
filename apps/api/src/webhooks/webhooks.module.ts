import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { NotificationModule } from '../notification/notification.module';
import { SentimentModule } from '../sentiment/sentiment.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { InsightsModule } from '../insights/insights.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [MessagesModule, NotificationModule, SentimentModule, AnalyticsModule, InsightsModule, RecommendationsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
