import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { N8nService } from './n8n.service';

describe('N8nService', () => {
  let service: N8nService;
  let mockConfigService: Partial<ConfigService>;

  describe('without webhook URL', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          N8nService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<N8nService>(N8nService);
    });

    it('should return fallback when no webhook URL configured', async () => {
      const result = await service.sendToAI('conv-1', 'hello', 'user-1');
      expect(result).toEqual({ fallback: true, message: 'AI service is not configured.' });
    });
  });

  describe('with webhook URL', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue('http://n8n:5678/webhook/test'),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          N8nService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<N8nService>(N8nService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return response on successful call', async () => {
      const mockResponse = { message: 'AI response' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.sendToAI('conv-1', 'hello', 'user-1');
      expect(result).toEqual(mockResponse);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://n8n:5678/webhook/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should pass context when provided', async () => {
      const context = [{ role: 'user', content: 'previous' }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'response' }),
      });

      await service.sendToAI('conv-1', 'hello', 'user-1', context);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.context).toEqual(context);
    });

    it('should return fallback after all retries fail', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.sendToAI('conv-1', 'hello', 'user-1');

      expect(result).toEqual({
        fallback: true,
        message: "I'm having trouble connecting right now. Please try again in a moment.",
      });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 30000);

    it('should retry on HTTP error', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'success' }) });

      const result = await service.sendToAI('conv-1', 'hello', 'user-1');
      expect(result).toEqual({ message: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);
  });
});
