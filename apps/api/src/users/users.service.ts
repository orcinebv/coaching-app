import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateCoachingSettingsDto } from './dto/update-coaching-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: { email: string; password: string; name: string }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getSettings(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return this.prisma.settings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    return this.prisma.settings.upsert({
      where: { userId },
      update: updateSettingsDto,
      create: { userId, ...updateSettingsDto },
    });
  }

  async getCoachingSettings(userId: string) {
    const settings = await this.prisma.coachingSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return this.prisma.coachingSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateCoachingSettings(userId: string, dto: UpdateCoachingSettingsDto) {
    return this.prisma.coachingSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
      select: { id: true, isOnboarded: true },
    });
  }

  async exportMyData(userId: string) {
    const [
      user,
      settings,
      coachingSettings,
      checkIns,
      goals,
      journalEntries,
      conversations,
      exerciseCompletions,
      sentimentResults,
      insights,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      }),
      this.prisma.settings.findUnique({ where: { userId } }),
      this.prisma.coachingSettings.findUnique({ where: { userId } }),
      this.prisma.checkIn.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.conversation.findMany({
        where: { userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.exerciseCompletion.findMany({
        where: { userId },
        include: { exercise: { select: { title: true, category: true } } },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.sentimentResult.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.userInsight.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user,
      settings,
      coachingSettings,
      data: {
        checkIns,
        goals,
        journalEntries,
        conversations,
        exerciseCompletions,
        sentimentResults,
        insights,
      },
    };
  }

  async deleteMyAccount(userId: string) {
    const anonymizedEmail = `deleted_${crypto.randomBytes(8).toString('hex')}@deleted.invalid`;
    const anonymizedName = 'Deleted User';

    // Soft delete + anonymize PII
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: anonymizedName,
        password: crypto.randomBytes(32).toString('hex'),
        avatar: null,
        isActive: false,
        deletedAt: new Date(),
      },
    });

    // Delete all sessions
    await this.prisma.session.deleteMany({ where: { userId } });

    return { message: 'Account successfully deleted and data anonymized' };
  }

  async getMyAuditLog(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  }
}
