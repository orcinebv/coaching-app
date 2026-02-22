import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  settings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  coachingSettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 'user-1', email: 'test@example.com', name: 'Test' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    const userResult = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userResult);

      const result = await service.findById('user-1');

      expect(result).toEqual(userResult);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const data = { email: 'new@example.com', password: 'hashed', name: 'New User' };
      const createdUser = { id: 'user-2', ...data };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(data);

      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'USER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('getSettings', () => {
    const userId = 'user-1';
    const settings = {
      id: 'settings-1',
      userId,
      theme: 'light',
      notifications: true,
    };

    it('should return existing settings', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(settings);

      const result = await service.getSettings(userId);

      expect(result).toEqual(settings);
      expect(mockPrismaService.settings.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.settings.create).not.toHaveBeenCalled();
    });

    it('should create settings if they do not exist', async () => {
      const newSettings = { id: 'settings-2', userId };
      mockPrismaService.settings.findUnique.mockResolvedValue(null);
      mockPrismaService.settings.create.mockResolvedValue(newSettings);

      const result = await service.getSettings(userId);

      expect(result).toEqual(newSettings);
      expect(mockPrismaService.settings.create).toHaveBeenCalledWith({
        data: { userId },
      });
    });
  });

  describe('updateSettings', () => {
    it('should upsert settings', async () => {
      const userId = 'user-1';
      const updateSettingsDto = { theme: 'dark' };
      const updatedSettings = { id: 'settings-1', userId, theme: 'dark' };
      mockPrismaService.settings.upsert.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(userId, updateSettingsDto);

      expect(result).toEqual(updatedSettings);
      expect(mockPrismaService.settings.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: updateSettingsDto,
        create: { userId, ...updateSettingsDto },
      });
    });
  });

  describe('getCoachingSettings', () => {
    const userId = 'user-1';
    const coachingSettings = {
      id: 'cs-1',
      userId,
      coachingStyle: 'supportive',
      focusAreas: '["stress","productiviteit"]',
      weeklyGoal: 3,
      reminderEnabled: true,
      reminderFrequency: 'daily',
    };

    it('should return existing coaching settings', async () => {
      mockPrismaService.coachingSettings.findUnique.mockResolvedValue(coachingSettings);

      const result = await service.getCoachingSettings(userId);

      expect(result).toEqual(coachingSettings);
      expect(mockPrismaService.coachingSettings.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.coachingSettings.create).not.toHaveBeenCalled();
    });

    it('should create default coaching settings if none exist', async () => {
      const defaultSettings = { id: 'cs-2', userId };
      mockPrismaService.coachingSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.coachingSettings.create.mockResolvedValue(defaultSettings);

      const result = await service.getCoachingSettings(userId);

      expect(result).toEqual(defaultSettings);
      expect(mockPrismaService.coachingSettings.create).toHaveBeenCalledWith({
        data: { userId },
      });
    });
  });

  describe('updateCoachingSettings', () => {
    const userId = 'user-1';

    it('should upsert coaching settings', async () => {
      const dto = { coachingStyle: 'challenging', weeklyGoal: 5 };
      const updated = { id: 'cs-1', userId, ...dto };
      mockPrismaService.coachingSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateCoachingSettings(userId, dto as any);

      expect(result).toEqual(updated);
      expect(mockPrismaService.coachingSettings.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: dto,
        create: { userId, ...dto },
      });
    });

    it('should support all valid coachingStyle values', async () => {
      for (const style of ['supportive', 'challenging', 'analytical']) {
        const dto = { coachingStyle: style };
        const updated = { id: 'cs-1', userId, coachingStyle: style };
        mockPrismaService.coachingSettings.upsert.mockResolvedValue(updated);

        const result = await service.updateCoachingSettings(userId, dto as any);

        expect(result.coachingStyle).toBe(style);
      }
    });

    it('should support partial updates', async () => {
      const dto = { reminderEnabled: false };
      const updated = { id: 'cs-1', userId, reminderEnabled: false };
      mockPrismaService.coachingSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateCoachingSettings(userId, dto as any);

      expect(result).toEqual(updated);
      expect(mockPrismaService.coachingSettings.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: dto,
        create: { userId, ...dto },
      });
    });
  });
});
