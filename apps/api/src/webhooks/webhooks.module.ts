import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { NotificationModule } from '../notification/notification.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [MessagesModule, NotificationModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
