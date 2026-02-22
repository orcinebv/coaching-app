import { Injectable, Logger } from '@nestjs/common';
import { N8nService } from './n8n.service';

export interface AiJob {
  conversationId: string;
  message: string;
  userId: string;
  context?: { role: string; content: string }[];
}

@Injectable()
export class AiQueueProcessor {
  private readonly logger = new Logger(AiQueueProcessor.name);

  constructor(private n8nService: N8nService) {}

  async process(job: AiJob): Promise<any> {
    this.logger.log(`Processing AI job for conversation ${job.conversationId}`);

    const result = await this.n8nService.sendToAI(
      job.conversationId,
      job.message,
      job.userId,
      job.context,
    );

    this.logger.log(`AI job completed for conversation ${job.conversationId}`);
    return result;
  }
}
