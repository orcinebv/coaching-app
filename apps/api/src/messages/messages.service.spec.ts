import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';

const mockPrismaService = {
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockConversationsService = {
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConversationsService, useValue: mockConversationsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const conversationId = 'conv-1';
    const userId = 'user-1';
    const content = 'Hello world';

    it('should verify ownership and create a user message', async () => {
      const message = { id: 'msg-1', content, role: 'user', conversationId };
      mockConversationsService.findOne.mockResolvedValue({ id: conversationId, userId });
      mockPrismaService.message.create.mockResolvedValue(message);

      const result = await service.create(conversationId, userId, content);

      expect(mockConversationsService.findOne).toHaveBeenCalledWith(conversationId, userId);
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: {
          content,
          role: 'user',
          conversationId,
        },
      });
      expect(result).toEqual(message);
    });

    it('should not verify ownership for non-user messages', async () => {
      const message = { id: 'msg-2', content: 'AI response', role: 'assistant', conversationId };
      mockPrismaService.message.create.mockResolvedValue(message);

      const result = await service.create(conversationId, userId, 'AI response', 'assistant');

      expect(mockConversationsService.findOne).not.toHaveBeenCalled();
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: {
          content: 'AI response',
          role: 'assistant',
          conversationId,
        },
      });
      expect(result).toEqual(message);
    });

    it('should use default role of user', async () => {
      mockConversationsService.findOne.mockResolvedValue({ id: conversationId, userId });
      mockPrismaService.message.create.mockResolvedValue({
        id: 'msg-3',
        content,
        role: 'user',
        conversationId,
      });

      await service.create(conversationId, userId, content);

      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'user' }),
      });
    });
  });

  describe('findByConversation', () => {
    const conversationId = 'conv-1';
    const userId = 'user-1';

    it('should return paginated messages', async () => {
      const messages = [
        { id: 'msg-1', content: 'Hello', role: 'user' },
        { id: 'msg-2', content: 'Hi there', role: 'assistant' },
      ];
      mockConversationsService.findOne.mockResolvedValue({ id: conversationId, userId });
      mockPrismaService.message.findMany.mockResolvedValue(messages);
      mockPrismaService.message.count.mockResolvedValue(2);

      const result = await service.findByConversation(conversationId, userId);

      expect(mockConversationsService.findOne).toHaveBeenCalledWith(conversationId, userId);
      expect(result).toEqual({
        data: messages,
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
    });

    it('should handle pagination parameters', async () => {
      mockConversationsService.findOne.mockResolvedValue({ id: conversationId, userId });
      mockPrismaService.message.findMany.mockResolvedValue([]);
      mockPrismaService.message.count.mockResolvedValue(100);

      const result = await service.findByConversation(conversationId, userId, 2, 25);

      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip: 25,
        take: 25,
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.totalPages).toBe(4);
    });
  });

  describe('triggerN8nWebhook', () => {
    const conversationId = 'conv-1';
    const messageContent = 'Hello';
    const userId = 'user-1';

    it('should return null when webhook URL is not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await service.triggerN8nWebhook(conversationId, messageContent, userId);

      expect(result).toBeNull();
      expect(mockConfigService.get).toHaveBeenCalledWith('N8N_WEBHOOK_URL');
      consoleSpy.mockRestore();
    });

    it('should call webhook URL and return response', async () => {
      const webhookUrl = 'https://n8n.example.com/webhook/test';
      mockConfigService.get.mockReturnValue(webhookUrl);

      const mockResponse = { success: true };
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.triggerN8nWebhook(conversationId, messageContent, userId);

      expect(fetchSpy).toHaveBeenCalledWith(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageContent,
          userId,
        }),
      });
      expect(result).toEqual(mockResponse);
      fetchSpy.mockRestore();
    });

    it('should return null when fetch fails', async () => {
      mockConfigService.get.mockReturnValue('https://n8n.example.com/webhook/test');
      const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.triggerN8nWebhook(conversationId, messageContent, userId);

      expect(result).toBeNull();
      fetchSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
