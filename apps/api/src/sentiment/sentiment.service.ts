import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
}

@Injectable()
export class SentimentService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async analyzeText(
    userId: string,
    text: string,
    sourceType: 'journal' | 'message',
    sourceId: string,
  ) {
    const textHash = Buffer.from(text.slice(0, 100)).toString('base64').replace(/[+/=]/g, '').slice(0, 32);
    const cacheKey = `sentiment:${textHash}`;

    const aiResult = await this.ai.call({
      service: 'coaching-sentiment',
      userId,
      payload: { text },
      cacheKey,
      cacheTtl: 86400,
    });

    let emotions: EmotionScores;
    let overall: number;
    let crisis: boolean;

    if (aiResult.fallback || !aiResult.data) {
      const analysis = this.ruleBasedSentiment(text);
      emotions = analysis.emotions;
      overall = analysis.overall;
      crisis = analysis.crisis;
    } else {
      emotions = aiResult.data.emotions ?? this.ruleBasedSentiment(text).emotions;
      overall = aiResult.data.overall ?? 0;
      crisis = aiResult.data.crisis ?? false;
    }

    const result = await this.prisma.sentimentResult.create({
      data: {
        userId,
        sourceType,
        sourceId,
        overall,
        emotions: JSON.stringify(emotions),
        crisis,
        segments: JSON.stringify([]),
      },
    });

    return { ...result, emotions, crisis };
  }

  async getSentimentHistory(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.prisma.sentimentResult.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    return results.map(r => ({
      ...r,
      emotions: JSON.parse(r.emotions) as EmotionScores,
    }));
  }

  async getSentimentSummary(userId: string) {
    const history = await this.getSentimentHistory(userId, 30);

    if (history.length === 0) {
      return { avgOverall: null, dominantEmotion: null, trend: 'stable', crisisDetected: false, totalAnalyses: 0 };
    }

    const avgOverall = history.reduce((sum, r) => sum + r.overall, 0) / history.length;

    const emotionTotals: EmotionScores = { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 };
    history.forEach(r => {
      const e = r.emotions as EmotionScores;
      (Object.keys(emotionTotals) as (keyof EmotionScores)[]).forEach(k => {
        emotionTotals[k] += e[k] || 0;
      });
    });
    const dominantEmotion = (Object.entries(emotionTotals) as [string, number][]).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    const half = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, half);
    const secondHalf = history.slice(half);
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.overall, 0) / firstHalf.length : 0;
    const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.overall, 0) / secondHalf.length : 0;
    const trend = avgSecond > avgFirst + 0.1 ? 'improving' : avgSecond < avgFirst - 0.1 ? 'declining' : 'stable';

    const crisisDetected = history.some(r => r.crisis);

    return {
      avgOverall: Math.round(avgOverall * 100) / 100,
      dominantEmotion,
      trend,
      crisisDetected,
      totalAnalyses: history.length,
    };
  }

  private ruleBasedSentiment(text: string): { overall: number; crisis: boolean; emotions: EmotionScores } {
    const lower = text.toLowerCase();

    const positiveWords = ['blij', 'happy', 'goed', 'geweldig', 'dankbaar', 'fijn', 'vrolijk', 'tevreden', 'mooi', 'super', 'top', 'trots', 'energie'];
    const negativeWords = ['slecht', 'rot', 'verdrietig', 'moeilijk', 'pijn', 'moe', 'depressief', 'hopeloos', 'sad', 'bad', 'ellendig'];
    const crisisWords = ['zelfmoord', 'suïcide', 'wil niet meer leven', 'geen zin meer', 'leven beëindigen', 'einde aan mijn leven'];
    const angerWords = ['boos', 'kwaad', 'woedend', 'irritant', 'haat', 'frustratie', 'irriteer'];
    const fearWords = ['bang', 'angstig', 'bezorgd', 'nerveus', 'paniek', 'stress', 'zorgen'];

    let posCount = 0, negCount = 0, angerCount = 0, fearCount = 0;
    positiveWords.forEach(w => { if (lower.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (lower.includes(w)) negCount++; });
    angerWords.forEach(w => { if (lower.includes(w)) angerCount++; });
    fearWords.forEach(w => { if (lower.includes(w)) fearCount++; });

    const crisis = crisisWords.some(w => lower.includes(w));
    const total = Math.max(posCount + negCount + angerCount + fearCount, 1);
    const overall = (posCount - negCount - angerCount * 0.7 - fearCount * 0.5) / total;

    return {
      overall: Math.max(-1, Math.min(1, overall)),
      crisis,
      emotions: {
        joy: Math.min(1, posCount / 3),
        sadness: Math.min(1, negCount / 3),
        anger: Math.min(1, angerCount / 3),
        fear: Math.min(1, fearCount / 3),
        surprise: 0,
      },
    };
  }
}
