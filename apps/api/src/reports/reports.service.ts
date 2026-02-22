import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async requestReport(userId: string, type: 'week' | 'month') {
    const now = new Date();
    let period: string;
    if (type === 'week') {
      const weekNum = this.getWeekNumber(now);
      period = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    } else {
      period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const existing = await this.prisma.report.findFirst({
      where: { userId, type, period, status: { in: ['pending', 'ready'] } },
    });
    if (existing) return existing;

    const report = await this.prisma.report.create({
      data: {
        userId,
        type,
        period,
        status: 'processing',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate content asynchronously
    this.generateReportContent(report.id, userId, type, period).catch(console.error);

    return report;
  }

  private async generateReportContent(reportId: string, userId: string, type: string, period: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      const now = new Date();
      let startDate: Date;
      if (type === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const [checkIns, goals, journalEntries, exerciseCompletions] = await Promise.all([
        this.prisma.checkIn.findMany({
          where: { userId, createdAt: { gte: startDate } },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.goal.findMany({ where: { userId } }),
        this.prisma.journalEntry.findMany({
          where: { userId, createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        this.prisma.exerciseCompletion.findMany({
          where: { userId, completedAt: { gte: startDate } },
          include: { exercise: { select: { title: true, category: true } } },
        }),
      ]);

      const avgMood = checkIns.length > 0
        ? (checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length).toFixed(1)
        : 'N/A';
      const avgEnergy = checkIns.length > 0
        ? (checkIns.reduce((s, c) => s + c.energy, 0) / checkIns.length).toFixed(1)
        : 'N/A';

      const content = JSON.stringify({
        generatedAt: new Date().toISOString(),
        user: user?.name,
        period,
        type,
        summary: {
          checkIns: checkIns.length,
          avgMood,
          avgEnergy,
          goalsCompleted: goals.filter(g => g.status === 'completed').length,
          goalsTotal: goals.length,
          journalEntries: journalEntries.length,
          exercisesCompleted: exerciseCompletions.length,
        },
        recentJournal: journalEntries.slice(0, 3).map(e => ({
          date: e.createdAt,
          preview: e.content.substring(0, 100),
        })),
        exerciseHighlights: exerciseCompletions.slice(0, 5).map(c => ({
          title: c.exercise.title,
          category: c.exercise.category,
          date: c.completedAt,
        })),
      });

      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'ready', content },
      });
    } catch (error) {
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'failed' },
      });
    }
  }

  async getReports(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(id: string, userId: string) {
    const report = await this.prisma.report.findFirst({ where: { id, userId } });
    if (!report) return null;
    if (report.content) {
      return { ...report, data: JSON.parse(report.content) };
    }
    return report;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
