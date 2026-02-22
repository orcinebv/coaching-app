import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../apps/api/src/prisma/prisma.service';
import { BaseRepository } from './base.repository';

interface Message {
  id: string;
  content: string;
  role: string;
  conversationId: string;
  createdAt: Date;
}

interface CreateMessageData {
  content: string;
  role: string;
  conversationId: string;
}

interface UpdateMessageData {
  content?: string;
}

@Injectable()
export class MessageRepository extends BaseRepository<Message, CreateMessageData, UpdateMessageData> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: options?.where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  async findByConversation(conversationId: string, skip: number, take: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.message.count({ where });
  }

  async create(data: CreateMessageData): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  async update(id: string, data: UpdateMessageData): Promise<Message> {
    return this.prisma.message.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Message> {
    return this.prisma.message.delete({ where: { id } });
  }
}
