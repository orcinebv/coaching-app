import { Module } from '@nestjs/common';
import { N8nService } from './n8n.service';
import { AiQueueService } from './ai-queue.service';
import { AiQueueProcessor } from './ai-queue.processor';

@Module({
  providers: [N8nService, AiQueueService, AiQueueProcessor],
  exports: [N8nService, AiQueueService],
})
export class N8nModule {}
