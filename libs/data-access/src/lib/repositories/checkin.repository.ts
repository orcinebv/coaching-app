import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../apps/api/src/prisma/prisma.service';
import { BaseRepository } from './base.repository';

interface CheckIn {
  id: string;
  userId: string;
  mood: number;
  energy: number;
  notes: string | null;
  goals: string | null;
  createdAt: Date;
}

interface CreateCheckInData {
  userId: string;
  mood: number;
  energy: number;
  notes?: string;
  goals?: string;
}

interface UpdateCheckInData {
  mood?: number;
  energy?: number;
  notes?: string;
  goals?: string;
}

@Injectable()
export class CheckInRepository extends BaseRepository<CheckIn, CreateCheckInData, UpdateCheckInData> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<CheckIn | null> {
    return this.prisma.checkIn.findUnique({ where: { id } });
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<CheckIn[]> {
    return this.prisma.checkIn.findMany({
      where: options?.where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  async findByUser(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }): Promise<CheckIn[]> {
    const where: Record<string, unknown> = { userId };

    if (options?.startDate || options?.endDate) {
      const createdAt: Record<string, Date> = {};
      if (options.startDate) createdAt['gte'] = options.startDate;
      if (options.endDate) createdAt['lte'] = options.endDate;
      where['createdAt'] = createdAt;
    }

    return this.prisma.checkIn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.checkIn.count({ where });
  }

  async create(data: CreateCheckInData): Promise<CheckIn> {
    return this.prisma.checkIn.create({ data });
  }

  async update(id: string, data: UpdateCheckInData): Promise<CheckIn> {
    return this.prisma.checkIn.update({ where: { id }, data });
  }

  async delete(id: string): Promise<CheckIn> {
    return this.prisma.checkIn.delete({ where: { id } });
  }
}
