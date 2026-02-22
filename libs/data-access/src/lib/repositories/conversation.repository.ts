import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../apps/api/src/prisma/prisma.service';
import { BaseRepository } from './base.repository';

interface Conversation {
  id: string;
  title: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateConversationData {
  title: string;
  userId: string;
}

interface UpdateConversationData {
  title?: string;
  status?: string;
}

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation, CreateConversationData, UpdateConversationData> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({ where: { id } });
  }

  async findByIdWithMessages(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: options?.where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  async findByUserWithLastMessage(userId: string, skip: number, take: number) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.conversation.count({ where });
  }

  async create(data: CreateConversationData): Promise<Conversation> {
    return this.prisma.conversation.create({ data });
  }

  async update(id: string, data: UpdateConversationData): Promise<Conversation> {
    return this.prisma.conversation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Conversation> {
    await this.prisma.message.deleteMany({ where: { conversationId: id } });
    return this.prisma.conversation.delete({ where: { id } });
  }
}
