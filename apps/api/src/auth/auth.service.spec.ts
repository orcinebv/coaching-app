import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  settings: {
    create: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const createdUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'USER',
    };

    it('should register a new user and return access token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockPrismaService.settings.create.mockResolvedValue({});
      mockPrismaService.session.create.mockResolvedValue({ id: 'session-1' });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashed-password',
          name: registerDto.name,
        },
      });
      expect(mockPrismaService.settings.create).toHaveBeenCalledWith({
        data: { userId: createdUser.id },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: expect.any(String),
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
        },
      });
    });

    it('should throw ConflictException if email already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(createdUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'USER',
    };

    it('should login and return access token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.session.create.mockResolvedValue({ id: 'session-1' });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: expect.any(String),
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new token pair for valid refresh token', async () => {
      const session = {
        id: 'session-1',
        token: 'hashed-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 86400000), // tomorrow
        user: { id: 'user-1', email: 'test@example.com', name: 'Test', role: 'USER' },
      };
      mockPrismaService.session.findUnique.mockResolvedValue(session);
      mockPrismaService.session.delete.mockResolvedValue(session);
      mockPrismaService.session.create.mockResolvedValue({ id: 'session-2' });
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshTokens('raw-refresh-token');

      expect(result).toHaveProperty('access_token', 'new-jwt-token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);
      await expect(service.refreshTokens('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const session = {
        id: 'session-1',
        token: 'hashed',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 86400000), // yesterday
        user: { id: 'user-1', email: 'test@example.com' },
      };
      mockPrismaService.session.findUnique.mockResolvedValue(session);
      mockPrismaService.session.delete.mockResolvedValue(session);

      await expect(service.refreshTokens('raw-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete session when found', async () => {
      const session = { id: 'session-1', token: 'hashed' };
      mockPrismaService.session.findUnique.mockResolvedValue(session);
      mockPrismaService.session.delete.mockResolvedValue(session);

      await service.revokeRefreshToken('raw-token');

      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
    });

    it('should do nothing when session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await service.revokeRefreshToken('invalid');

      expect(mockPrismaService.session.delete).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'USER',
    };

    it('should return user when credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(existingUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', existingUser.password);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
