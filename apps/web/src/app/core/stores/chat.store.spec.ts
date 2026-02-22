import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatStore } from './chat.store';
import { ApiService } from '../services/api.service';
import { environment } from '../../../../environments/environment';

describe('ChatStore', () => {
  let store: InstanceType<typeof ChatStore>;
  let httpMock: HttpTestingController;

  const mockConversations = [
    { id: 'conv-1', title: 'Conversation 1', userId: 'user-1', status: 'active', createdAt: '2026-02-01', updatedAt: '2026-02-01' },
    { id: 'conv-2', title: 'Conversation 2', userId: 'user-1', status: 'active', createdAt: '2026-02-02', updatedAt: '2026-02-02' },
  ];

  const mockMessages = [
    { id: 'msg-1', content: 'Hello', role: 'user', conversationId: 'conv-1', createdAt: '2026-02-01T10:00:00Z' },
    { id: 'msg-2', content: 'Hi!', role: 'assistant', conversationId: 'conv-1', createdAt: '2026-02-01T10:01:00Z' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatStore, ApiService],
    });

    store = TestBed.inject(ChatStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeDefined();
  });

  describe('initial state', () => {
    it('should have empty conversations', () => {
      expect(store.conversations()).toEqual([]);
    });

    it('should have null currentConversation', () => {
      expect(store.currentConversation()).toBeNull();
    });

    it('should have empty messages', () => {
      expect(store.messages()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should not be sending', () => {
      expect(store.sending()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('conversationCount should be 0 initially', () => {
      expect(store.conversationCount()).toBe(0);
    });

    it('messageCount should be 0 initially', () => {
      expect(store.messageCount()).toBe(0);
    });
  });

  describe('loadConversations', () => {
    it('should load conversations from API', async () => {
      const loadPromise = store.loadConversations();

      const req = httpMock.expectOne(`${environment.apiUrl}/conversations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConversations);

      await loadPromise;

      expect(store.conversations()).toEqual(mockConversations);
      expect(store.conversationCount()).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('should set error on failure', async () => {
      const loadPromise = store.loadConversations();

      const req = httpMock.expectOne(`${environment.apiUrl}/conversations`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should add message to messages array', () => {
      const message = { id: 'msg-3', content: 'New message', role: 'user', conversationId: 'conv-1', createdAt: '2026-02-01T10:02:00Z' } as any;
      store.addMessage(message);
      expect(store.messages()).toEqual([message]);
      expect(store.messageCount()).toBe(1);
    });
  });

  describe('setSending', () => {
    it('should set sending to true', () => {
      store.setSending(true);
      expect(store.sending()).toBe(true);
    });

    it('should set sending to false', () => {
      store.setSending(true);
      store.setSending(false);
      expect(store.sending()).toBe(false);
    });
  });

  describe('clearCurrentConversation', () => {
    it('should clear current conversation and messages', () => {
      store.addMessage({ id: 'msg-1', content: 'test' } as any);
      store.clearCurrentConversation();
      expect(store.currentConversation()).toBeNull();
      expect(store.messages()).toEqual([]);
    });
  });

  describe('createConversation', () => {
    it('should create a conversation and add to list', async () => {
      const newConv = { id: 'conv-new', title: 'New Chat', userId: 'user-1', status: 'active', createdAt: '2026-02-15', updatedAt: '2026-02-15' };
      const createPromise = store.createConversation('New Chat');

      const req = httpMock.expectOne(`${environment.apiUrl}/conversations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New Chat' });
      req.flush(newConv);

      const result = await createPromise;

      expect(result).toEqual(newConv);
      expect(store.conversations()).toContainEqual(newConv);
      expect(store.currentConversation()).toEqual(newConv);
      expect(store.loading()).toBe(false);
    });

    it('should return null on failure', async () => {
      const createPromise = store.createConversation('New Chat');

      const req = httpMock.expectOne(`${environment.apiUrl}/conversations`);
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

      const result = await createPromise;

      expect(result).toBeNull();
      expect(store.error()).toBeTruthy();
    });
  });

  describe('archiveConversation', () => {
    it('should remove conversation from list', async () => {
      // First load conversations
      const loadPromise = store.loadConversations();
      const loadReq = httpMock.expectOne(`${environment.apiUrl}/conversations`);
      loadReq.flush(mockConversations);
      await loadPromise;

      expect(store.conversationCount()).toBe(2);

      // Archive one
      const archivePromise = store.archiveConversation('conv-1');
      const archiveReq = httpMock.expectOne(`${environment.apiUrl}/conversations/conv-1`);
      expect(archiveReq.request.method).toBe('PATCH');
      archiveReq.flush({});
      await archivePromise;

      expect(store.conversations().find(c => c.id === 'conv-1')).toBeUndefined();
      expect(store.conversationCount()).toBe(1);
    });
  });
});
