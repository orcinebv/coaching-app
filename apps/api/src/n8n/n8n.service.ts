import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly webhookUrl: string | undefined;
  private readonly maxRetries = 3;
  private readonly timeoutMs = 30000;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>(
      'N8N_COACHING_CHAT_WEBHOOK',
      'http://n8n:5678/webhook/coaching-chat',
    );
  }

  async sendToAI(
    conversationId: string,
    message: string,
    userId: string,
    context?: { role: string; content: string }[],
  ): Promise<any> {
    if (!this.webhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL not configured, skipping AI trigger');
      return { fallback: true, message: 'AI service is not configured.' };
    }

    const payload = { conversationId, message, userId, history: context };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `Sending to AI (attempt ${attempt}/${this.maxRetries}) for conversation ${conversationId}`,
        );

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        this.logger.log(`AI response received for conversation ${conversationId}`);
        return result;
      } catch (error) {
        this.logger.error(
          `AI request failed (attempt ${attempt}/${this.maxRetries}): ${error}`,
        );

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `All ${this.maxRetries} AI request attempts failed for conversation ${conversationId}`,
    );
    return {
      fallback: true,
      message:
        'I\'m having trouble connecting right now. Please try again in a moment.',
    };
  }
}
