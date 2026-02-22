import { Test, TestingModule } from '@nestjs/testing';
import { AiQueueService } from './ai-queue.service';
import { N8nService } from './n8n.service';

const mockN8nService = {
  sendToAI: jest.fn(),
};

describe('AiQueueService', () => {
  let service: AiQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiQueueService,
        { provide: N8nService, useValue: mockN8nService },
      ],
    }).compile();

    service = module.get<AiQueueService>(AiQueueService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToQueue', () => {
    it('should call n8nService.sendToAI', async () => {
      mockN8nService.sendToAI.mockResolvedValue({ message: 'response' });

      const result = await service.addToQueue('conv-1', 'hello', 'user-1');

      expect(result).toEqual({ message: 'response' });
      expect(mockN8nService.sendToAI).toHaveBeenCalledWith('conv-1', 'hello', 'user-1', undefined);
    });

    it('should pass context to n8nService', async () => {
      const context = [{ role: 'user', content: 'previous' }];
      mockN8nService.sendToAI.mockResolvedValue({ message: 'response' });

      await service.addToQueue('conv-1', 'hello', 'user-1', context);

      expect(mockN8nService.sendToAI).toHaveBeenCalledWith('conv-1', 'hello', 'user-1', context);
    });
  });
});
