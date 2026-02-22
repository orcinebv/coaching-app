import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  conversation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  message: {
    deleteMany: jest.fn(),
  },
};

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const userId = 'user-1';
      const createDto = { title: 'New Conversation' };
      const created = { id: 'conv-1', title: 'New Conversation', userId };
      mockPrismaService.conversation.create.mockResolvedValue(created);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(created);
      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          userId,
        },
      });
    });
  });

  describe('findAllByUser', () => {
    const userId = 'user-1';

    it('should return paginated conversations', async () => {
      const conversations = [
        { id: 'conv-1', title: 'Conv 1', userId, messages: [] },
        { id: 'conv-2', title: 'Conv 2', userId, messages: [] },
      ];
      mockPrismaService.conversation.findMany.mockResolvedValue(conversations);
      mockPrismaService.conversation.count.mockResolvedValue(2);

      const result = await service.findAllByUser(userId, 1, 20);

      expect(result).toEqual({
        data: conversations,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 20,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.conversation.findMany.mockResolvedValue([]);
      mockPrismaService.conversation.count.mockResolvedValue(25);

      const result = await service.findAllByUser(userId, 2, 10);

      expect(result).toEqual({
        data: [],
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should use default pagination values', async () => {
      mockPrismaService.conversation.findMany.mockResolvedValue([]);
      mockPrismaService.conversation.count.mockResolvedValue(0);

      const result = await service.findAllByUser(userId);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    const userId = 'user-1';

    it('should return a conversation with messages', async () => {
      const conversation = {
        id: 'conv-1',
        title: 'Test',
        userId,
        messages: [{ id: 'msg-1', content: 'Hello' }],
      };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);

      const result = await service.findOne('conv-1', userId);

      expect(result).toEqual(conversation);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    });

    it('should throw NotFoundException when conversation not found', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own conversation', async () => {
      const conversation = {
        id: 'conv-1',
        title: 'Test',
        userId: 'other-user',
        messages: [],
      };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);

      await expect(service.findOne('conv-1', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const userId = 'user-1';
      const conversation = {
        id: 'conv-1',
        title: 'Old Title',
        userId,
        messages: [],
      };
      const updatedConversation = { ...conversation, title: 'New Title' };

      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.conversation.update.mockResolvedValue(updatedConversation);

      const result = await service.update('conv-1', userId, { title: 'New Title' });

      expect(result).toEqual(updatedConversation);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        data: { title: 'New Title' },
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', 'user-1', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete messages first then conversation', async () => {
      const userId = 'user-1';
      const conversation = {
        id: 'conv-1',
        title: 'Test',
        userId,
        messages: [],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.message.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.conversation.delete.mockResolvedValue(conversation);

      const result = await service.delete('conv-1', userId);

      expect(result).toEqual(conversation);
      expect(mockPrismaService.message.deleteMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
      });
      expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.message.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.conversation.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own conversation', async () => {
      const conversation = {
        id: 'conv-1',
        title: 'Test',
        userId: 'other-user',
        messages: [],
      };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);

      await expect(service.delete('conv-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.message.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.conversation.delete).not.toHaveBeenCalled();
    });
  });

  describe('getContextForAI', () => {
    it('should return last N messages formatted for AI', async () => {
      const conversation = {
        id: 'conv-1',
        userId: 'user-1',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' },
          { role: 'user', content: 'Help me' },
        ],
      };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);

      const result = await service.getContextForAI('conv-1', 'user-1', 2);

      expect(result).toEqual([
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'Help me' },
      ]);
    });

    it('should throw NotFoundException for invalid conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);
      await expect(service.getContextForAI('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrCreateActive', () => {
    it('should return existing active conversation', async () => {
      const existing = { id: 'conv-1', title: 'Active', status: 'active', messages: [] };
      mockPrismaService.conversation.findFirst.mockResolvedValue(existing);

      const result = await service.getOrCreateActive('user-1');
      expect(result).toEqual(existing);
    });

    it('should create new conversation when no active exists', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(null);
      const created = { id: 'conv-2', title: 'New Conversation', messages: [] };
      mockPrismaService.conversation.create.mockResolvedValue(created);

      const result = await service.getOrCreateActive('user-1');
      expect(result).toEqual(created);
    });

    it('should use custom title for new conversation', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(null);
      mockPrismaService.conversation.create.mockResolvedValue({ id: 'conv-2', title: 'Custom' });

      await service.getOrCreateActive('user-1', 'Custom');

      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
        data: { title: 'Custom', userId: 'user-1' },
        include: { messages: true },
      });
    });
  });

  describe('archiveConversation', () => {
    it('should set status to archived', async () => {
      const conversation = { id: 'conv-1', userId: 'user-1', messages: [] };
      const archived = { ...conversation, status: 'archived' };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.conversation.update.mockResolvedValue(archived);

      const result = await service.archiveConversation('conv-1', 'user-1');
      expect(result.status).toBe('archived');
    });

    it('should throw NotFoundException for invalid conversation', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);
      await expect(service.archiveConversation('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('closeConversation', () => {
    it('should set status to closed', async () => {
      const conversation = { id: 'conv-1', userId: 'user-1', messages: [] };
      const closed = { ...conversation, status: 'closed' };
      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.conversation.update.mockResolvedValue(closed);

      const result = await service.closeConversation('conv-1', 'user-1');
      expect(result.status).toBe('closed');
    });
  });
});
