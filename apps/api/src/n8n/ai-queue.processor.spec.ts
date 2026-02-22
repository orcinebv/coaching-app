import { Test, TestingModule } from '@nestjs/testing';
import { AiQueueProcessor } from './ai-queue.processor';
import { N8nService } from './n8n.service';

const mockN8nService = {
  sendToAI: jest.fn(),
};

describe('AiQueueProcessor', () => {
  let processor: AiQueueProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiQueueProcessor,
        { provide: N8nService, useValue: mockN8nService },
      ],
    }).compile();

    processor = module.get<AiQueueProcessor>(AiQueueProcessor);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should call n8nService.sendToAI with job data', async () => {
      const job = { conversationId: 'conv-1', message: 'hello', userId: 'user-1' };
      mockN8nService.sendToAI.mockResolvedValue({ message: 'response' });

      const result = await processor.process(job);

      expect(result).toEqual({ message: 'response' });
      expect(mockN8nService.sendToAI).toHaveBeenCalledWith('conv-1', 'hello', 'user-1', undefined);
    });

    it('should pass context from job', async () => {
      const job = {
        conversationId: 'conv-1',
        message: 'hello',
        userId: 'user-1',
        context: [{ role: 'user', content: 'hi' }],
      };
      mockN8nService.sendToAI.mockResolvedValue({ message: 'response' });

      await processor.process(job);

      expect(mockN8nService.sendToAI).toHaveBeenCalledWith('conv-1', 'hello', 'user-1', job.context);
    });
  });
});
