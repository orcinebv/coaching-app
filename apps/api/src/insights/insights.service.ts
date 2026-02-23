import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getInsights(userId: string) {
    return this.prisma.userInsight.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.userInsight.updateMany({ where: { id, userId }, data: { isRead: true } });
  }

  async generateInsights(userId: string) {
    const [checkIns, journal, goals, exercises, existing] = await Promise.all([
      this.prisma.checkIn.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 90 }),
      this.prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.goal.findMany({ where: { userId } }),
      this.prisma.exerciseCompletion.findMany({ where: { userId }, orderBy: { completedAt: 'desc' }, take: 30 }),
      this.prisma.userInsight.findMany({ where: { userId }, select: { title: true } }),
    ]);

    const existingTitles = new Set(existing.map(i => i.title));
    const toCreate: any[] = [];

    if (journal.length >= 7) {
      const title = `Je hebt ${journal.length} dagboekentries geschreven!`;
      if (!existingTitles.has(title)) {
        toCreate.push({
          userId, type: 'milestone', title,
          content: 'Geweldig! Je hebt consistent je gedachten bijgehouden. Schrijven helpt bij zelfreflectie en emotionele verwerking.',
          data: JSON.stringify({ count: journal.length }),
          expiresAt: new Date(Date.now() + 30 * 86400000),
        });
      }
    }

    if (exercises.length >= 10) {
      const title = `Je hebt ${exercises.length} oefeningen voltooid!`;
      if (!existingTitles.has(title)) {
        toCreate.push({
          userId, type: 'milestone', title,
          content: "Fantastisch! Je bent actief bezig met je persoonlijke ontwikkeling. Zo'n inzet maakt een groot verschil.",
          data: JSON.stringify({ count: exercises.length }),
          expiresAt: new Date(Date.now() + 30 * 86400000),
        });
      }
    }

    if (checkIns.length >= 7) {
      const dayTotals: Record<number, { total: number; count: number }> = {};
      for (let i = 0; i < 7; i++) dayTotals[i] = { total: 0, count: 0 };
      checkIns.forEach(ci => {
        const day = new Date(ci.createdAt).getDay();
        dayTotals[day].total += ci.mood;
        dayTotals[day].count++;
      });
      const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
      const best = Object.entries(dayTotals)
        .filter(([, d]) => d.count > 0)
        .map(([day, d]) => ({ day: parseInt(day), avg: d.total / d.count }))
        .sort((a, b) => b.avg - a.avg)[0];

      if (best) {
        const title = `Je voelt je het beste op ${dayNames[best.day]}`;
        if (!existingTitles.has(title)) {
          toCreate.push({
            userId, type: 'pattern', title,
            content: `Op basis van je check-ins voel je je gemiddeld het beste op ${dayNames[best.day]} (gemiddeld ${best.avg.toFixed(1)}/10). Gebruik dit als je beste dag voor uitdagende taken!`,
            data: JSON.stringify({ bestDay: dayNames[best.day], avgMood: best.avg }),
            expiresAt: new Date(Date.now() + 14 * 86400000),
          });
        }
      }
    }

    const completedGoals = goals.filter(g => g.status === 'completed');
    if (completedGoals.length > 0) {
      const pl = completedGoals.length > 1;
      const title = `Je hebt ${completedGoals.length} doel${pl ? 'en' : ''} bereikt!`;
      if (!existingTitles.has(title)) {
        toCreate.push({
          userId, type: 'milestone', title,
          content: `Wauw, je hebt ${completedGoals.length} SMART doel${pl ? 'en' : ''} voltooid! Dat is een fantastische prestatie.`,
          data: JSON.stringify({ count: completedGoals.length }),
          expiresAt: new Date(Date.now() + 7 * 86400000),
        });
      }
    }

    if (checkIns.length >= 10) {
      const half = Math.floor(checkIns.length / 2);
      const older = checkIns.slice(half);
      const newer = checkIns.slice(0, half);
      const oldAvg = older.reduce((s, c) => s + c.mood, 0) / older.length;
      const newAvg = newer.reduce((s, c) => s + c.mood, 0) / newer.length;
      const diff = newAvg - oldAvg;

      if (diff > 0.5) {
        const title = 'Je stemming is verbeterd de laatste tijd!';
        if (!existingTitles.has(title)) {
          toCreate.push({
            userId, type: 'comparison', title,
            content: `Je gemiddelde stemming is gestegen van ${oldAvg.toFixed(1)} naar ${newAvg.toFixed(1)}. Je bent duidelijk op de goede weg!`,
            data: JSON.stringify({ oldAvg, newAvg, improvement: diff }),
            expiresAt: new Date(Date.now() + 7 * 86400000),
          });
        }
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.userInsight.createMany({ data: toCreate });
    }

    return this.getInsights(userId);
  }
}
