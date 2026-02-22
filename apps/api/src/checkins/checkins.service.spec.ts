import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckInsService } from './checkins.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  checkIn: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  conversation: {
    findUnique: jest.fn(),
  },
};

describe('CheckInsService', () => {
  let service: CheckInsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CheckInsService>(CheckInsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a check-in', async () => {
      const userId = 'user-1';
      const createDto = { mood: 8, energy: 7, notes: 'Feeling good', goals: 'Exercise' };
      const checkIn = { id: 'checkin-1', userId, ...createDto };
      mockPrismaService.checkIn.create.mockResolvedValue(checkIn);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(checkIn);
      expect(mockPrismaService.checkIn.create).toHaveBeenCalledWith({
        data: {
          userId,
          mood: createDto.mood,
          energy: createDto.energy,
          notes: createDto.notes,
          goals: createDto.goals,
        },
      });
    });
  });

  describe('findAllByUser', () => {
    const userId = 'user-1';

    it('should return paginated check-ins', async () => {
      const checkIns = [
        { id: 'checkin-1', userId, mood: 8, energy: 7 },
        { id: 'checkin-2', userId, mood: 6, energy: 5 },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);
      mockPrismaService.checkIn.count.mockResolvedValue(2);

      const result = await service.findAllByUser(userId, {});

      expect(result).toEqual({
        data: checkIns,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by start date', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      mockPrismaService.checkIn.count.mockResolvedValue(0);

      await service.findAllByUser(userId, { startDate: '2026-01-01' });

      expect(mockPrismaService.checkIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            createdAt: { gte: new Date('2026-01-01') },
          },
        }),
      );
    });

    it('should filter by end date', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      mockPrismaService.checkIn.count.mockResolvedValue(0);

      await service.findAllByUser(userId, { endDate: '2026-02-01' });

      expect(mockPrismaService.checkIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            createdAt: { lte: new Date('2026-02-01') },
          },
        }),
      );
    });

    it('should filter by both start and end date', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      mockPrismaService.checkIn.count.mockResolvedValue(0);

      await service.findAllByUser(userId, {
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });

      expect(mockPrismaService.checkIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            createdAt: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-02-01'),
            },
          },
        }),
      );
    });

    it('should handle pagination parameters', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      mockPrismaService.checkIn.count.mockResolvedValue(50);

      const result = await service.findAllByUser(userId, { page: 3, limit: 10 });

      expect(mockPrismaService.checkIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('findOne', () => {
    const userId = 'user-1';

    it('should return a check-in by id', async () => {
      const checkIn = { id: 'checkin-1', userId, mood: 8, energy: 7 };
      mockPrismaService.checkIn.findUnique.mockResolvedValue(checkIn);

      const result = await service.findOne('checkin-1', userId);

      expect(result).toEqual(checkIn);
      expect(mockPrismaService.checkIn.findUnique).toHaveBeenCalledWith({
        where: { id: 'checkin-1' },
      });
    });

    it('should throw NotFoundException when check-in not found', async () => {
      mockPrismaService.checkIn.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when check-in belongs to another user', async () => {
      const checkIn = { id: 'checkin-1', userId: 'other-user', mood: 8, energy: 7 };
      mockPrismaService.checkIn.findUnique.mockResolvedValue(checkIn);

      await expect(service.findOne('checkin-1', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    const userId = 'user-1';

    it('should return zero stats when no check-ins exist', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);

      const result = await service.getStats(userId);

      expect(result).toEqual({
        averageMood: 0,
        averageEnergy: 0,
        totalCheckIns: 0,
        trends: [],
      });
    });

    it('should calculate averages correctly', async () => {
      const checkIns = [
        { id: '1', mood: 8, energy: 6, createdAt: new Date('2026-02-10') },
        { id: '2', mood: 6, energy: 8, createdAt: new Date('2026-02-11') },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getStats(userId);

      expect(result.averageMood).toBe(7);
      expect(result.averageEnergy).toBe(7);
      expect(result.totalCheckIns).toBe(2);
    });

    it('should group trends by week', async () => {
      // Two check-ins in the same week (week starting Sunday 2026-02-08)
      const checkIns = [
        { id: '1', mood: 8, energy: 6, createdAt: new Date('2026-02-09') },
        { id: '2', mood: 6, energy: 4, createdAt: new Date('2026-02-10') },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getStats(userId);

      expect(result.trends).toHaveLength(1);
      expect(result.trends[0].averageMood).toBe(7);
      expect(result.trends[0].averageEnergy).toBe(5);
      expect(result.trends[0].count).toBe(2);
    });

    it('should have multiple trend entries for different weeks', async () => {
      const checkIns = [
        { id: '1', mood: 8, energy: 6, createdAt: new Date('2026-02-02') },
        { id: '2', mood: 6, energy: 4, createdAt: new Date('2026-02-12') },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getStats(userId);

      expect(result.trends.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getMoodEmoji', () => {
    it('should return correct emoji for mood 1', () => {
      expect(service.getMoodEmoji(1)).toBe('😢');
    });

    it('should return correct emoji for mood 10', () => {
      expect(service.getMoodEmoji(10)).toBe('🤩');
    });

    it('should throw BadRequestException for mood 0', () => {
      expect(() => service.getMoodEmoji(0)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for mood 11', () => {
      expect(() => service.getMoodEmoji(11)).toThrow(BadRequestException);
    });
  });

  describe('create validation', () => {
    it('should throw BadRequestException for mood below 1', async () => {
      await expect(service.create('user-1', { mood: 0, energy: 5 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for mood above 10', async () => {
      await expect(service.create('user-1', { mood: 11, energy: 5 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for energy below 1', async () => {
      await expect(service.create('user-1', { mood: 5, energy: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for energy above 10', async () => {
      await expect(service.create('user-1', { mood: 5, energy: 11 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTrends', () => {
    it('should return empty trends for no check-ins', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      const result = await service.getTrends('user-1', 'week');
      expect(result).toEqual({
        period: 'week',
        data: [],
        averageMood: 0,
        averageEnergy: 0,
        totalCheckIns: 0,
      });
    });

    it('should aggregate data by day', async () => {
      const today = new Date();
      const checkIns = [
        { mood: 8, energy: 7, createdAt: today },
        { mood: 6, energy: 5, createdAt: today },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getTrends('user-1', 'week');

      expect(result.totalCheckIns).toBe(2);
      expect(result.data).toHaveLength(1); // Same day
      expect(result.averageMood).toBe(7);
      expect(result.averageEnergy).toBe(6);
    });

    it('should handle month period', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      const result = await service.getTrends('user-1', 'month');
      expect(result.period).toBe('month');
    });

    it('should handle quarter period', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      const result = await service.getTrends('user-1', 'quarter');
      expect(result.period).toBe('quarter');
    });
  });

  describe('getCheckInsForConversation', () => {
    it('should return check-ins within conversation timeframe', async () => {
      const conversation = {
        id: 'conv-1',
        userId: 'user-1',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date('2026-02-15'),
      };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      const checkIns = [{ id: 'c-1', mood: 8 }];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getCheckInsForConversation('conv-1', 'user-1');
      expect(result).toEqual(checkIns);
    });

    it('should throw NotFoundException for invalid conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);
      await expect(service.getCheckInsForConversation('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for other users conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue({ id: 'conv-1', userId: 'other' });
      await expect(service.getCheckInsForConversation('conv-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAggregateStats', () => {
    it('should return zero stats for no check-ins', async () => {
      mockPrismaService.checkIn.findMany.mockResolvedValue([]);
      const result = await service.getAggregateStats('user-1');
      expect(result).toEqual({
        totalCheckIns: 0,
        averageMood: 0,
        averageEnergy: 0,
        bestDay: null,
        worstDay: null,
        currentStreak: 0,
      });
    });

    it('should calculate aggregate stats correctly', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const checkIns = [
        { id: '1', mood: 8, energy: 7, createdAt: today },
        { id: '2', mood: 4, energy: 3, createdAt: new Date(today.getTime() - 86400000) },
      ];
      mockPrismaService.checkIn.findMany.mockResolvedValue(checkIns);

      const result = await service.getAggregateStats('user-1');
      expect(result.totalCheckIns).toBe(2);
      expect(result.averageMood).toBe(6);
      expect(result.averageEnergy).toBe(5);
      expect(result.bestDay).toBeDefined();
      expect(result.bestDay.mood).toBe(8);
      expect(result.worstDay).toBeDefined();
      expect(result.worstDay.mood).toBe(4);
    });
  });
});
