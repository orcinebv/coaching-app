import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

const FALLBACK_PROMPTS = [
  { type: 'reflection', prompt: 'Wat heeft je vandaag een goed gevoel gegeven, hoe klein ook?' },
  { type: 'gratitude', prompt: 'Noem drie dingen waarvoor je dankbaar bent op dit moment.' },
  { type: 'goal', prompt: 'Welke kleine stap kun jij vandaag zetten richting je grootste doel?' },
  { type: 'reflection', prompt: 'Wat zou je aan je jongere zelf willen vertellen over het moment van nu?' },
  { type: 'challenge', prompt: 'Welke uitdaging vermijd je al een tijdje? Wat maakt het zo lastig?' },
  { type: 'reflection', prompt: 'Beschrijf een moment deze week waar je trots op bent.' },
  { type: 'goal', prompt: 'Als je één ding kon veranderen aan je dagelijkse routine, wat zou dat zijn?' },
  { type: 'gratitude', prompt: 'Welke persoon in je leven heeft je de afgelopen tijd positief beïnvloed?' },
  { type: 'challenge', prompt: 'Wat is de moeilijkste les die je recent hebt geleerd?' },
  { type: 'reflection', prompt: 'Hoe ziet een perfecte dag voor jou eruit? Wat kun je doen om morgen daar dichter bij te komen?' },
  { type: 'reflection', prompt: 'Wanneer voel je jezelf het meest energiek? Hoe kun je meer van die momenten creëren?' },
  { type: 'goal', prompt: 'Wat wil je over een jaar anders doen dan nu? Wat is de eerste stap?' },
  { type: 'gratitude', prompt: 'Welk aspect van jezelf waardeer je het meest, en waarom?' },
  { type: 'challenge', prompt: 'Wat doet je energie weglekken? Hoe zou je dit kunnen verminderen?' },
];

@Injectable()
export class CoachingPromptsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async getDailyPrompt(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailyPrompt.findFirst({
      where: { userId, createdAt: { gte: today } },
    });
    if (existing) return existing;

    return this.generatePrompt(userId);
  }

  async generatePrompt(userId: string) {
    const [recentMood, recentJournal, activeGoals] = await Promise.all([
      this.prisma.checkIn.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.journalEntry.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.goal.count({ where: { userId, status: 'active' } }),
    ]);

    const context = {
      recentMood: recentMood?.mood ?? null,
      hasActiveGoals: activeGoals > 0,
      lastJournalDaysAgo: recentJournal
        ? Math.floor((Date.now() - new Date(recentJournal.createdAt).getTime()) / 86400000)
        : null,
    };

    const aiResult = await this.ai.call({
      service: 'coaching-prompt',
      userId,
      payload: { context },
      cacheKey: null,
    });

    let prompt: string;
    let type: string;

    if (!aiResult.fallback && aiResult.data?.prompt) {
      prompt = aiResult.data.prompt;
      type = aiResult.data.type || 'reflection';
    } else {
      const recentPrompts = await this.prisma.dailyPrompt.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 14 * 86400000) } },
        select: { prompt: true },
      });
      const usedTexts = new Set(recentPrompts.map(p => p.prompt));
      const available = FALLBACK_PROMPTS.filter(p => !usedTexts.has(p.prompt));
      const pool = available.length > 0 ? available : FALLBACK_PROMPTS;

      let selected = pool[Math.floor(Math.random() * pool.length)];
      if (context.recentMood !== null && context.recentMood <= 4) {
        const gratitude = pool.filter(p => p.type === 'gratitude');
        if (gratitude.length > 0) selected = gratitude[Math.floor(Math.random() * gratitude.length)];
      } else if (context.hasActiveGoals) {
        const goal = pool.filter(p => p.type === 'goal');
        if (goal.length > 0) selected = goal[Math.floor(Math.random() * goal.length)];
      }

      prompt = selected.prompt;
      type = selected.type;
    }

    return this.prisma.dailyPrompt.create({
      data: { userId, prompt, type, context: JSON.stringify(context) },
    });
  }

  async ratePrompt(userId: string, promptId: string, rating: number) {
    return this.prisma.dailyPrompt.updateMany({
      where: { id: promptId, userId },
      data: { rating },
    });
  }

  async skipPrompt(userId: string, promptId: string) {
    return this.prisma.dailyPrompt.updateMany({
      where: { id: promptId, userId },
      data: { skipped: true },
    });
  }

  async getPromptHistory(userId: string) {
    return this.prisma.dailyPrompt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 14,
    });
  }
}
