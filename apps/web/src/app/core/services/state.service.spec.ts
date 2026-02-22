import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { Conversation, Message, CheckIn, CheckInStats } from '@coaching-app/shared/types';

describe('StateService', () => {
  let service: StateService;

  const mockConversation: Conversation = {
    id: 'conv-1',
    title: 'Test Conversation',
    userId: 'user-1',
    status: 'active',
  };

  const mockConversation2: Conversation = {
    id: 'conv-2',
    title: 'Second Conversation',
    userId: 'user-1',
  };

  const mockMessage: Message = {
    id: 'msg-1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Hello',
  };

  const mockMessage2: Message = {
    id: 'msg-2',
    conversationId: 'conv-1',
    role: 'assistant',
    content: 'Hi there!',
  };

  const mockCheckIn: CheckIn = {
    id: 'ci-1',
    mood: 4,
    energy: 3,
    notes: 'Feeling good',
  };

  const mockCheckIn2: CheckIn = {
    id: 'ci-2',
    mood: 5,
    energy: 5,
    notes: 'Great day',
  };

  const mockStats: CheckInStats = {
    totalConversations: 10,
    totalCheckIns: 5,
    averageMood: 3.8,
    averageEnergy: 4.0,
    currentStreak: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StateService],
    });
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('conversations$', () => {
    it('should start with empty array', (done) => {
      service.conversations$.subscribe((conversations) => {
        expect(conversations).toEqual([]);
        done();
      });
    });

    it('should emit new conversations when set', (done) => {
      const convos = [mockConversation, mockConversation2];
      service.setConversations(convos);

      service.conversations$.subscribe((conversations) => {
        expect(conversations).toEqual(convos);
        expect(conversations.length).toBe(2);
        done();
      });
    });
  });

  describe('currentConversation$', () => {
    it('should start with null', (done) => {
      service.currentConversation$.subscribe((conversation) => {
        expect(conversation).toBeNull();
        done();
      });
    });

    it('should emit current conversation when set', (done) => {
      service.setCurrentConversation(mockConversation);

      service.currentConversation$.subscribe((conversation) => {
        expect(conversation).toEqual(mockConversation);
        done();
      });
    });

    it('should allow setting null', (done) => {
      service.setCurrentConversation(mockConversation);
      service.setCurrentConversation(null);

      service.currentConversation$.subscribe((conversation) => {
        expect(conversation).toBeNull();
        done();
      });
    });
  });

  describe('messages$', () => {
    it('should start with empty array', (done) => {
      service.messages$.subscribe((messages) => {
        expect(messages).toEqual([]);
        done();
      });
    });

    it('should emit new messages when set', (done) => {
      const msgs = [mockMessage, mockMessage2];
      service.setMessages(msgs);

      service.messages$.subscribe((messages) => {
        expect(messages).toEqual(msgs);
        done();
      });
    });

    it('should append message with addMessage', (done) => {
      service.setMessages([mockMessage]);
      service.addMessage(mockMessage2);

      service.messages$.subscribe((messages) => {
        expect(messages.length).toBe(2);
        expect(messages[0]).toEqual(mockMessage);
        expect(messages[1]).toEqual(mockMessage2);
        done();
      });
    });

    it('should add message to empty list', (done) => {
      service.addMessage(mockMessage);

      service.messages$.subscribe((messages) => {
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual(mockMessage);
        done();
      });
    });
  });

  describe('checkIns$', () => {
    it('should start with empty array', (done) => {
      service.checkIns$.subscribe((checkIns) => {
        expect(checkIns).toEqual([]);
        done();
      });
    });

    it('should emit new check-ins when set', (done) => {
      const checkIns = [mockCheckIn, mockCheckIn2];
      service.setCheckIns(checkIns);

      service.checkIns$.subscribe((result) => {
        expect(result).toEqual(checkIns);
        done();
      });
    });

    it('should prepend check-in with addCheckIn', (done) => {
      service.setCheckIns([mockCheckIn]);
      service.addCheckIn(mockCheckIn2);

      service.checkIns$.subscribe((checkIns) => {
        expect(checkIns.length).toBe(2);
        expect(checkIns[0]).toEqual(mockCheckIn2);
        expect(checkIns[1]).toEqual(mockCheckIn);
        done();
      });
    });
  });

  describe('stats$', () => {
    it('should start with null', (done) => {
      service.stats$.subscribe((stats) => {
        expect(stats).toBeNull();
        done();
      });
    });

    it('should emit stats when set', (done) => {
      service.setStats(mockStats);

      service.stats$.subscribe((stats) => {
        expect(stats).toEqual(mockStats);
        done();
      });
    });
  });

  describe('clearAll', () => {
    it('should reset all state to initial values', () => {
      service.setConversations([mockConversation]);
      service.setCurrentConversation(mockConversation);
      service.setMessages([mockMessage]);
      service.setCheckIns([mockCheckIn]);
      service.setStats(mockStats);

      service.clearAll();

      const results: Record<string, unknown> = {};

      service.conversations$.subscribe((v) => (results['conversations'] = v));
      service.currentConversation$.subscribe((v) => (results['currentConversation'] = v));
      service.messages$.subscribe((v) => (results['messages'] = v));
      service.checkIns$.subscribe((v) => (results['checkIns'] = v));
      service.stats$.subscribe((v) => (results['stats'] = v));

      expect(results['conversations']).toEqual([]);
      expect(results['currentConversation']).toBeNull();
      expect(results['messages']).toEqual([]);
      expect(results['checkIns']).toEqual([]);
      expect(results['stats']).toBeNull();
    });
  });
});
