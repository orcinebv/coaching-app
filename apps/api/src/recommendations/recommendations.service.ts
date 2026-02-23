import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string) {
    const existing = await this.prisma.recommendation.findMany({
      where: {
        userId,
        dismissed: false,
        createdAt: { gte: new Date(Date.now() - 24 * 3600000) },
      },
      include: { exercise: true },
      orderBy: { score: 'desc' },
      take: 5,
    });

    if (existing.length >= 3) return existing;

    await this.generateRecommendations(userId);

    return this.prisma.recommendation.findMany({
      where: { userId, dismissed: false },
      include: { exercise: true },
      orderBy: { score: 'desc' },
      take: 5,
    });
  }

  private async generateRecommendations(userId: string) {
    const [recentMood, recentExercises, exercises] = await Promise.all([
      this.prisma.checkIn.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
      this.prisma.exerciseCompletion.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10,
        select: { exerciseId: true },
      }),
      this.prisma.exercise.findMany({ where: { isActive: true } }),
    ]);

    if (exercises.length === 0) return;

    const avgMood = recentMood.length > 0
      ? recentMood.reduce((s, c) => s + c.mood, 0) / recentMood.length
      : 5;
    const recentExerciseIds = new Set(recentExercises.map(e => e.exerciseId));

    const scored = exercises.map(exercise => {
      let score = 0.5;
      let reason = 'Past bij jouw coachingprogramma';

      if (avgMood <= 4) {
        if (exercise.category === 'ontspanning' || exercise.category === 'mindfulness') {
          score += 0.3;
          reason = 'Helpt bij ontspanning wanneer je je minder goed voelt';
        }
      } else if (avgMood >= 7) {
        if (exercise.category === 'doelen' || exercise.category === 'groei') {
          score += 0.2;
          reason = 'Nuttig wanneer je je goed voelt en vooruitgang wil boeken';
        }
      }

      if (recentExerciseIds.has(exercise.id)) score -= 0.3;
      if (avgMood < 5 && exercise.difficulty === 'beginner') score += 0.1;

      return { exercise, score, reason };
    });

    const top = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    await this.prisma.recommendation.deleteMany({
      where: { userId, createdAt: { lt: new Date(Date.now() - 48 * 3600000) } },
    });

    await Promise.all(
      top.map(({ exercise, score, reason }) =>
        this.prisma.recommendation.create({
          data: { userId, exerciseId: exercise.id, type: 'exercise', title: exercise.title, reason, score },
        }),
      ),
    );
  }

  async giveFeedback(userId: string, id: string, helpful: boolean) {
    return this.prisma.recommendation.updateMany({ where: { id, userId }, data: { helpful } });
  }

  async dismiss(userId: string, id: string) {
    return this.prisma.recommendation.updateMany({ where: { id, userId }, data: { dismissed: true } });
  }
}
