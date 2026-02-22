import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { N8nService } from '../n8n/n8n.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private conversationsService: ConversationsService,
    private n8nService: N8nService,
  ) {}

  async create(conversationId: string, userId: string, content: string, role = 'user') {
    // Verify ownership if it's a user message
    if (role === 'user') {
      await this.conversationsService.findOne(conversationId, userId);
    }

    return this.prisma.message.create({
      data: {
        content,
        role,
        conversationId,
      },
    });
  }

  async findByConversation(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify ownership
    await this.conversationsService.findOne(conversationId, userId);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async triggerN8nWebhook(conversationId: string, messageContent: string, userId: string) {
    return this.n8nService.sendToAI(conversationId, messageContent, userId);
  }
}
