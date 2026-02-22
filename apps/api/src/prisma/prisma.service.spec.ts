import { Test, TestingModule } from '@nestjs/testing';

// We need to mock PrismaPg before importing PrismaService
// The mock adapter must return something PrismaClient accepts
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({
    provider: 'postgres',
    adapterName: 'pg',
  })),
}));

// Mock PrismaClient so the constructor doesn't actually try to connect
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $connect = mockConnect;
      $disconnect = mockDisconnect;
      constructor() {}
    },
  };
});

// Import AFTER mocks are set up
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    mockConnect.mockClear();
    mockDisconnect.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      await service.onModuleInit();

      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      await service.onModuleDestroy();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
