import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoachService {
  constructor(private prisma: PrismaService) {}

  async getCoachees(coachId: string) {
    const relations = await this.prisma.organizationUser.findMany({
      where: { coachId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        organization: { select: { id: true, name: true } },
      },
    });

    const coacheeIds = relations.map((r) => r.userId);

    if (coacheeIds.length === 0) return [];

    // Get latest check-in and sentiment for each coachee
    const [recentCheckIns, recentSentiments] = await Promise.all([
      this.prisma.checkIn.findMany({
        where: { userId: { in: coacheeIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true, mood: true, energy: true, createdAt: true },
      }),
      this.prisma.sentimentResult.findMany({
        where: { userId: { in: coacheeIds }, crisis: true },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true, overall: true, crisis: true, createdAt: true },
      }),
    ]);

    const checkInMap = new Map(recentCheckIns.map((c) => [c.userId, c]));
    const crisisMap = new Map(recentSentiments.map((s) => [s.userId, s]));

    return relations.map((r) => ({
      ...r.user,
      organization: r.organization,
      lastCheckIn: checkInMap.get(r.userId) || null,
      hasCrisisAlert: crisisMap.has(r.userId),
      crisisInfo: crisisMap.get(r.userId) || null,
    }));
  }

  async getCoacheeOverview(coachId: string, coacheeId: string) {
    await this.validateCoachAccess(coachId, coacheeId);

    const [user, checkIns, goals, recentSentiment, insights] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: coacheeId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          isOnboarded: true,
        },
      }),
      this.prisma.checkIn.findMany({
        where: { userId: coacheeId },
        orderBy: { createdAt: 'desc' },
        take: 14,
        select: { mood: true, energy: true, notes: true, createdAt: true },
      }),
      this.prisma.goal.findMany({
        where: { userId: coacheeId, status: 'active' },
        select: { id: true, title: true, progress: true, timeBound: true, status: true },
      }),
      this.prisma.sentimentResult.findFirst({
        where: { userId: coacheeId },
        orderBy: { createdAt: 'desc' },
        select: { overall: true, emotions: true, crisis: true, createdAt: true },
      }),
      this.prisma.userInsight.findMany({
        where: { userId: coacheeId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, content: true, type: true, createdAt: true },
      }),
    ]);

    if (!user) throw new NotFoundException('Coachee not found');

    const avgMood =
      checkIns.length > 0
        ? checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length
        : null;

    return {
      user,
      stats: {
        avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        checkInCount: checkIns.length,
        activeGoals: goals.length,
        hasCrisisAlert: recentSentiment?.crisis || false,
      },
      recentCheckIns: checkIns,
      goals,
      latestSentiment: recentSentiment,
      unreedInsights: insights,
    };
  }

  async getCoacheeCheckIns(coachId: string, coacheeId: string, limit = 30) {
    await this.validateCoachAccess(coachId, coacheeId);

    return this.prisma.checkIn.findMany({
      where: { userId: coacheeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getCrisisAlerts(coachId: string) {
    const relations = await this.prisma.organizationUser.findMany({
      where: { coachId },
      select: { userId: true },
    });

    const coacheeIds = relations.map((r) => r.userId);
    if (coacheeIds.length === 0) return [];

    const alerts = await this.prisma.sentimentResult.findMany({
      where: {
        userId: { in: coacheeIds },
        crisis: true,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return alerts;
  }

  async addNote(coachId: string, coacheeId: string, content: string, isPrivate = true) {
    await this.validateCoachAccess(coachId, coacheeId);

    return this.prisma.coachNote.create({
      data: { coachId, coacheeId, content, isPrivate },
    });
  }

  async getNotes(coachId: string, coacheeId: string) {
    await this.validateCoachAccess(coachId, coacheeId);

    return this.prisma.coachNote.findMany({
      where: { coachId, coacheeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async validateCoachAccess(coachId: string, coacheeId: string) {
    const relation = await this.prisma.organizationUser.findFirst({
      where: { coachId, userId: coacheeId },
    });

    if (!relation) {
      throw new ForbiddenException('You are not the coach of this user');
    }
  }
}
