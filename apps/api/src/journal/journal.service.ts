import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

const DAILY_PROMPTS = [
  'Wat ben je vandaag dankbaar voor?',
  'Wat heeft je vandaag energie gegeven?',
  'Welke uitdaging ben je vandaag tegengekomen en hoe heb je ermee omgegaan?',
  'Wat heb je vandaag geleerd over jezelf?',
  'Beschrijf een moment van vandaag dat je trots op bent.',
  'Wat wil je morgen anders aanpakken?',
  'Hoe heb je vandaag gezorgd voor je welzijn?',
  'Welke gedachten of gevoelens heb je vandaag ervaren?',
  'Wat heeft je vandaag verrast of geïnspireerd?',
  'Hoe heb je vandaag bijgedragen aan je doelen?',
  'Beschrijf je mentale toestand aan het einde van de dag.',
  'Welke kleine overwinning mag je jezelf toeschrijven vandaag?',
  'Wat zou je je toekomstige zelf willen vertellen over vandaag?',
  'Hoe heb je vandaag grenzen gesteld of bewaakt?',
];

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  getDailyPrompt(): string {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }

  async create(userId: string, dto: CreateJournalEntryDto) {
    return this.prisma.journalEntry.create({
      data: {
        userId,
        prompt: dto.prompt,
        content: dto.content,
        mood: dto.mood,
        tags: JSON.stringify(dto.tags || []),
      },
    });
  }

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.journalEntry.count({ where: { userId } }),
    ]);
    return {
      data: entries.map(e => ({ ...e, tags: JSON.parse(e.tags) })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string) {
    const entry = await this.prisma.journalEntry.findFirst({ where: { id, userId } });
    if (!entry) throw new NotFoundException('Journal entry not found');
    return { ...entry, tags: JSON.parse(entry.tags) };
  }

  async update(id: string, userId: string, dto: UpdateJournalEntryDto) {
    await this.findOne(id, userId);
    const updated = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        content: dto.content,
        mood: dto.mood,
        tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
      },
    });
    return { ...updated, tags: JSON.parse(updated.tags) };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.journalEntry.delete({ where: { id } });
  }

  async getMoodTrend(userId: string) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { userId, mood: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { mood: true, createdAt: true },
    });
    return entries.reverse();
  }
}
