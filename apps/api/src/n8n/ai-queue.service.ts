import { Injectable, Logger } from '@nestjs/common';
import { N8nService } from './n8n.service';

export interface AiQueueJob {
  conversationId: string;
  message: string;
  userId: string;
  context?: { role: string; content: string }[];
}

@Injectable()
export class AiQueueService {
  private readonly logger = new Logger(AiQueueService.name);

  constructor(private n8nService: N8nService) {}

  async addToQueue(
    conversationId: string,
    message: string,
    userId: string,
    context?: { role: string; content: string }[],
  ): Promise<any> {
    this.logger.log(`Queueing AI request for conversation ${conversationId}`);
    return this.n8nService.sendToAI(conversationId, message, userId, context);
  }
}
