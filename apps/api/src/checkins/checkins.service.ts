import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😞',
  3: '😔',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🤩',
};

@Injectable()
export class CheckInsService {
  constructor(private prisma: PrismaService) {}

  getMoodEmoji(mood: number): string {
    if (mood < 1 || mood > 10) {
      throw new BadRequestException('Mood must be between 1 and 10');
    }
    return MOOD_EMOJIS[mood];
  }

  async create(userId: string, createCheckInDto: CreateCheckInDto) {
    if (createCheckInDto.mood < 1 || createCheckInDto.mood > 10) {
      throw new BadRequestException('Mood must be between 1 and 10');
    }
    if (createCheckInDto.energy < 1 || createCheckInDto.energy > 10) {
      throw new BadRequestException('Energy must be between 1 and 10');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found. Please log in again.');
    }

    return this.prisma.checkIn.create({
      data: {
        userId,
        mood: createCheckInDto.mood,
        energy: createCheckInDto.energy,
        notes: createCheckInDto.notes,
        goals: createCheckInDto.goals,
      },
    });
  }

  async findAllByUser(
    userId: string,
    options: { startDate?: string; endDate?: string; page?: number; limit?: number },
  ) {
    const { startDate, endDate, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [checkIns, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.checkIn.count({ where }),
    ]);

    return {
      data: checkIns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
    });

    if (!checkIn || checkIn.userId !== userId) {
      throw new NotFoundException('Check-in not found');
    }

    return checkIn;
  }

  async getStats(userId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (checkIns.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        totalCheckIns: 0,
        trends: [],
      };
    }

    const totalMood = checkIns.reduce((sum: number, c: { mood: number }) => sum + c.mood, 0);
    const totalEnergy = checkIns.reduce((sum: number, c: { energy: number }) => sum + c.energy, 0);

    // Group by week for trend data
    const weeklyData = new Map<string, { moods: number[]; energies: number[]; count: number }>();

    for (const checkIn of checkIns) {
      const date = new Date(checkIn.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { moods: [], energies: [], count: 0 });
      }

      const week = weeklyData.get(weekKey)!;
      week.moods.push(checkIn.mood);
      week.energies.push(checkIn.energy);
      week.count++;
    }

    const trends = Array.from(weeklyData.entries()).map(([week, data]) => ({
      week,
      averageMood: Math.round((data.moods.reduce((a, b) => a + b, 0) / data.count) * 10) / 10,
      averageEnergy:
        Math.round((data.energies.reduce((a, b) => a + b, 0) / data.count) * 10) / 10,
      count: data.count,
    }));

    return {
      averageMood: Math.round((totalMood / checkIns.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / checkIns.length) * 10) / 10,
      totalCheckIns: checkIns.length,
      trends,
    };
  }

  async getTrends(userId: string, period: 'week' | 'month' | 'quarter') {
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (checkIns.length === 0) {
      return { period, data: [], averageMood: 0, averageEnergy: 0, totalCheckIns: 0 };
    }

    const dailyData = new Map<string, { moods: number[]; energies: number[] }>();

    for (const checkIn of checkIns) {
      const dayKey = new Date(checkIn.createdAt).toISOString().split('T')[0];
      if (!dailyData.has(dayKey)) {
        dailyData.set(dayKey, { moods: [], energies: [] });
      }
      const day = dailyData.get(dayKey)!;
      day.moods.push(checkIn.mood);
      day.energies.push(checkIn.energy);
    }

    const data = Array.from(dailyData.entries()).map(([date, values]) => ({
      date,
      averageMood:
        Math.round((values.moods.reduce((a, b) => a + b, 0) / values.moods.length) * 10) / 10,
      averageEnergy:
        Math.round(
          (values.energies.reduce((a, b) => a + b, 0) / values.energies.length) * 10,
        ) / 10,
      count: values.moods.length,
    }));

    const totalMood = checkIns.reduce((sum, c) => sum + c.mood, 0);
    const totalEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0);

    return {
      period,
      data,
      averageMood: Math.round((totalMood / checkIns.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / checkIns.length) * 10) / 10,
      totalCheckIns: checkIns.length,
    };
  }

  async getCheckInsForConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.checkIn.findMany({
      where: {
        userId,
        createdAt: {
          gte: conversation.createdAt,
          lte: conversation.updatedAt,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAggregateStats(userId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (checkIns.length === 0) {
      return {
        totalCheckIns: 0,
        averageMood: 0,
        averageEnergy: 0,
        bestDay: null,
        worstDay: null,
        currentStreak: 0,
      };
    }

    const totalMood = checkIns.reduce((sum, c) => sum + c.mood, 0);
    const totalEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0);

    // Find best and worst days by mood
    let bestCheckIn = checkIns[0];
    let worstCheckIn = checkIns[0];

    for (const checkIn of checkIns) {
      if (checkIn.mood > bestCheckIn.mood) bestCheckIn = checkIn;
      if (checkIn.mood < worstCheckIn.mood) worstCheckIn = checkIn;
    }

    // Calculate current streak (consecutive days with check-ins)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDays = new Set(
      checkIns.map((c) => new Date(c.createdAt).toISOString().split('T')[0]),
    );

    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (checkInDays.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (currentStreak === 0) {
        // Allow starting from yesterday if no check-in today yet
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (checkInDays.has(yesterdayStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      totalCheckIns: checkIns.length,
      averageMood: Math.round((totalMood / checkIns.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / checkIns.length) * 10) / 10,
      bestDay: {
        date: bestCheckIn.createdAt,
        mood: bestCheckIn.mood,
        emoji: this.getMoodEmoji(bestCheckIn.mood),
      },
      worstDay: {
        date: worstCheckIn.createdAt,
        mood: worstCheckIn.mood,
        emoji: this.getMoodEmoji(worstCheckIn.mood),
      },
      currentStreak,
    };
  }
}
