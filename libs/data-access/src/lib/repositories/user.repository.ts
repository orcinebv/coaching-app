import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../apps/api/src/prisma/prisma.service';
import { BaseRepository } from './base.repository';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

interface UpdateUserData {
  name?: string;
  avatar?: string;
}

@Injectable()
export class UserRepository extends BaseRepository<User, CreateUserData, UpdateUserData> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      where: options?.where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
