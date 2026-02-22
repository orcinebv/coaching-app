import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SEED_EXERCISES = [
  {
    title: 'Box Breathing',
    description: 'Een krachtige ademhalingstechniek om stress te verminderen en focus te verbeteren.',
    category: 'breathing',
    duration: 5,
    difficulty: 'beginner',
    steps: JSON.stringify([
      'Adem 4 seconden in door de neus',
      'Houd 4 seconden vast',
      'Adem 4 seconden uit door de mond',
      'Houd 4 seconden vast',
      'Herhaal 4-8 keer',
    ]),
    benefits: JSON.stringify(['Vermindert stress', 'Verbetert focus', 'Kalmeert het zenuwstelsel']),
  },
  {
    title: '5-4-3-2-1 Grounding',
    description: 'Een grounding techniek om terug in het moment te komen bij angst of overweldiging.',
    category: 'grounding',
    duration: 5,
    difficulty: 'beginner',
    steps: JSON.stringify([
      'Noem 5 dingen die je KAN ZIEN',
      'Noem 4 dingen die je KAN VOELEN',
      'Noem 3 dingen die je KAN HOREN',
      'Noem 2 dingen die je KAN RUIKEN',
      'Noem 1 ding dat je KAN PROEVEN',
    ]),
    benefits: JSON.stringify(['Vermindert angst', 'Verhoogt bewustzijn', 'Brengt je terug in het moment']),
  },
  {
    title: 'Progressieve Spierontspanning',
    description: 'Systematisch aanspannen en ontspannen van spiergroepen om lichamelijke spanning los te laten.',
    category: 'relaxation',
    duration: 15,
    difficulty: 'beginner',
    steps: JSON.stringify([
      'Ga comfortabel liggen of zitten',
      'Begin met je voeten: span ze 5 seconden aan',
      'Ontspan en voel het verschil (10 seconden)',
      'Werk omhoog door kuiten, dijen, buik, handen, armen, schouders, gezicht',
      'Eindig met een paar diepe ademhalingen',
    ]),
    benefits: JSON.stringify(['Vermindert spierspanning', 'Verbetert slaap', 'Verlaagt stressniveau']),
  },
  {
    title: 'Mindful Wandelen',
    description: 'Loop bewust en aandachtig om je hoofd leeg te maken en je energie op te laden.',
    category: 'mindfulness',
    duration: 20,
    difficulty: 'beginner',
    steps: JSON.stringify([
      'Loop in een rustig tempo',
      'Focus op elke stap: hak, middenvoet, teen',
      'Merk je omgeving op: geluiden, kleuren, geuren',
      'Als gedachten komen, laat ze gaan en keer terug naar het lopen',
      'Eindig met 3 diepe ademhalingen',
    ]),
    benefits: JSON.stringify(['Verbetert stemming', 'Vermindert piekeren', 'Geeft energie']),
  },
  {
    title: 'Dankbaarheidsvisualisatie',
    description: 'Visualiseer drie positieve momenten van vandaag om je welzijn te verbeteren.',
    category: 'visualization',
    duration: 10,
    difficulty: 'beginner',
    steps: JSON.stringify([
      'Sluit je ogen en adem drie keer diep in',
      'Denk aan iets kleins waarvoor je dankbaar bent',
      'Visualiseer het levendig: wat zag je, voelde je, hoorde je?',
      'Voel de dankbaarheid in je lichaam',
      'Herhaal voor nog twee dingen',
    ]),
    benefits: JSON.stringify(['Verbetert welzijn', 'Verhoogt positiviteit', 'Versterkt veerkracht']),
  },
  {
    title: 'Coherente Ademhaling',
    description: 'Adem in een ritme van 5-6 seconden per cyclus voor optimale hartcoherentie.',
    category: 'breathing',
    duration: 10,
    difficulty: 'intermediate',
    steps: JSON.stringify([
      'Zit rechtop in een comfortabele houding',
      'Adem 5 seconden langzaam in door de neus',
      'Adem 5 seconden langzaam uit door de neus',
      'Houd dit ritme 10 minuten vol',
      'Focus alleen op de ademhaling',
    ]),
    benefits: JSON.stringify(['Verbetert hartcoherentie', 'Vermindert stresshormonen', 'Verhoogt emotionele regulatie']),
  },
  {
    title: 'Body Scan Meditatie',
    description: 'Scan je lichaam van top tot teen om spanning te detecteren en los te laten.',
    category: 'mindfulness',
    duration: 20,
    difficulty: 'intermediate',
    steps: JSON.stringify([
      'Ga liggen en sluit je ogen',
      'Begin bij de top van je hoofd',
      'Beweeg langzaam je aandacht omlaag door elk lichaamsdeel',
      'Merk spanning op zonder oordeel',
      'Stel je voor dat de spanning wegvloeit bij uitademen',
    ]),
    benefits: JSON.stringify(['Verhoogt lichaamsbewustzijn', 'Verbetert slaap', 'Vermindert chronische pijn']),
  },
  {
    title: 'Cognitieve Herstructurering',
    description: 'Identificeer en daag negatieve gedachten uit met behulp van bewijs en alternatieven.',
    category: 'cognitive',
    duration: 15,
    difficulty: 'advanced',
    steps: JSON.stringify([
      'Schrijf de negatieve gedachte op',
      'Vraag: Wat is het bewijs VOOR deze gedachte?',
      'Vraag: Wat is het bewijs TEGEN deze gedachte?',
      'Formuleer een meer gebalanceerde gedachte',
      'Beoordeel hoe je je nu voelt (1-10)',
    ]),
    benefits: JSON.stringify(['Vermindert negatief denken', 'Verbetert probleemoplossing', 'Verhoogt veerkracht']),
  },
];

@Injectable()
export class ExercisesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.exercise.count();
    if (count === 0) {
      await this.prisma.exercise.createMany({ data: SEED_EXERCISES });
    }
  }

  async findAll(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    const exercises = await this.prisma.exercise.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
    });
    return exercises.map(e => ({
      ...e,
      steps: JSON.parse(e.steps),
      benefits: JSON.parse(e.benefits),
    }));
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findFirst({ where: { id, isActive: true } });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return {
      ...exercise,
      steps: JSON.parse(exercise.steps),
      benefits: JSON.parse(exercise.benefits),
    };
  }

  async complete(userId: string, exerciseId: string, notes?: string, rating?: number) {
    await this.findOne(exerciseId);
    return this.prisma.exerciseCompletion.create({
      data: { userId, exerciseId, notes, rating },
      include: { exercise: true },
    });
  }

  async getCompletions(userId: string) {
    const completions = await this.prisma.exerciseCompletion.findMany({
      where: { userId },
      include: { exercise: { select: { title: true, category: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });
    return completions;
  }

  async getStats(userId: string) {
    const completions = await this.prisma.exerciseCompletion.findMany({
      where: { userId },
      include: { exercise: { select: { title: true, category: true, duration: true } } },
    });
    const total = completions.length;
    const totalMinutes = completions.reduce((sum, c) => sum + (c.exercise.duration || 0), 0);
    const categoryCounts: Record<string, number> = {};
    completions.forEach(c => {
      const cat = c.exercise.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const avgRating = total > 0
      ? completions.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) /
        completions.filter(c => c.rating).length || 0
      : 0;
    return { total, totalMinutes, categoryCounts, avgRating: Math.round(avgRating * 10) / 10 };
  }
}
