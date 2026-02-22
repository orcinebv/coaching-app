import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMoodPatterns(userId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 90,
    });

    if (checkIns.length === 0) {
      return { weekdayAverages: [], timeOfMonthPattern: [], correlations: null };
    }

    // Weekday averages (0=Sunday, 6=Saturday)
    const weekdayData: Record<number, { mood: number[]; energy: number[] }> = {};
    for (let i = 0; i < 7; i++) weekdayData[i] = { mood: [], energy: [] };

    checkIns.forEach(ci => {
      const day = new Date(ci.createdAt).getDay();
      weekdayData[day].mood.push(ci.mood);
      weekdayData[day].energy.push(ci.energy);
    });

    const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const weekdayAverages = Object.entries(weekdayData).map(([day, data]) => ({
      day: dayNames[parseInt(day)],
      avgMood: data.mood.length > 0 ? Math.round((data.mood.reduce((a, b) => a + b, 0) / data.mood.length) * 10) / 10 : null,
      avgEnergy: data.energy.length > 0 ? Math.round((data.energy.reduce((a, b) => a + b, 0) / data.energy.length) * 10) / 10 : null,
      count: data.mood.length,
    }));

    // Recent 30-day trend
    const recent30 = checkIns.slice(0, 30).reverse();
    const trendData = recent30.map(ci => ({
      date: ci.createdAt,
      mood: ci.mood,
      energy: ci.energy,
    }));

    // Calculate correlation between mood and energy
    const moods = checkIns.map(ci => ci.mood);
    const energies = checkIns.map(ci => ci.energy);
    const n = moods.length;
    const correlation = n > 1 ? this.pearsonCorrelation(moods, energies) : null;

    // Best/worst weekday
    const filledWeekdays = weekdayAverages.filter(d => d.avgMood !== null);
    const bestDay = filledWeekdays.length > 0
      ? filledWeekdays.reduce((best, curr) => (curr.avgMood! > best.avgMood! ? curr : best))
      : null;
    const worstDay = filledWeekdays.length > 0
      ? filledWeekdays.reduce((worst, curr) => (curr.avgMood! < worst.avgMood! ? curr : worst))
      : null;

    return {
      weekdayAverages,
      trendData,
      correlation: correlation ? Math.round(correlation * 100) / 100 : null,
      insights: {
        bestDay: bestDay?.day || null,
        worstDay: worstDay?.day || null,
        totalDataPoints: n,
      },
    };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    if (denX === 0 || denY === 0) return 0;
    return num / (denX * denY);
  }

  async getProgressSummary(userId: string) {
    const [checkInStats, goalStats, journalCount, exerciseStats] = await Promise.all([
      this.prisma.checkIn.aggregate({
        where: { userId },
        _avg: { mood: true, energy: true },
        _count: true,
      }),
      this.prisma.goal.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.journalEntry.count({ where: { userId } }),
      this.prisma.exerciseCompletion.count({ where: { userId } }),
    ]);

    const goalsByStatus = goalStats.reduce((acc: Record<string, number>, g) => {
      acc[g.status] = g._count;
      return acc;
    }, {});

    return {
      checkIns: {
        total: checkInStats._count,
        avgMood: Math.round((checkInStats._avg.mood || 0) * 10) / 10,
        avgEnergy: Math.round((checkInStats._avg.energy || 0) * 10) / 10,
      },
      goals: {
        total: goalStats.reduce((sum, g) => sum + g._count, 0),
        completed: goalsByStatus['completed'] || 0,
        active: goalsByStatus['active'] || 0,
      },
      journal: { total: journalCount },
      exercises: { total: exerciseStats },
    };
  }
}
