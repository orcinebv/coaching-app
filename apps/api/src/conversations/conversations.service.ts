import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createConversationDto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        title: createConversationDto.title,
        userId,
      },
    });
  }

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);

    return {
      data: conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async update(id: string, userId: string, updateConversationDto: UpdateConversationDto) {
    const conversation = await this.findOne(id, userId);

    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: updateConversationDto,
    });
  }

  async delete(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    await this.prisma.message.deleteMany({
      where: { conversationId: conversation.id },
    });

    return this.prisma.conversation.delete({
      where: { id: conversation.id },
    });
  }

  async getContextForAI(conversationId: string, userId: string, maxMessages = 10) {
    const conversation = await this.findOne(conversationId, userId);

    const messages = conversation.messages
      .slice(-maxMessages)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      }));

    return messages;
  }

  async getOrCreateActive(userId: string, title?: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId,
      },
      include: { messages: true },
    });
  }

  async archiveConversation(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'archived' },
    });
  }

  async closeConversation(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'closed' },
    });
  }
}
