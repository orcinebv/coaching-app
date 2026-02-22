import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { Conversation, Message } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ conversations, messages }) => ({
    conversationCount: computed(() => conversations().length),
    messageCount: computed(() => messages().length),
  })),
  withMethods((store) => {
    const api = inject(ApiService);

    return {
      async loadConversations(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(api.get<{ data: Conversation[] } | Conversation[]>('/conversations'));
          const conversations = Array.isArray(response) ? response : (response as any).data ?? [];
          patchState(store, { conversations, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Failed to load conversations' });
        }
      },

      async selectConversation(id: string): Promise<void> {
        const conversation = store.conversations().find(c => c.id === id) || null;
        patchState(store, { currentConversation: conversation, loading: true });
        try {
          const response = await firstValueFrom(api.get<{ data: Message[] } | Message[]>(`/conversations/${id}/messages`));
          const messages = Array.isArray(response) ? response : (response as any).data ?? [];
          patchState(store, { messages, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Failed to load messages' });
        }
      },

      addMessage(message: Message): void {
        patchState(store, { messages: [...store.messages(), message] });
      },

      setSending(sending: boolean): void {
        patchState(store, { sending });
      },

      async createConversation(title: string): Promise<Conversation | null> {
        patchState(store, { loading: true, error: null });
        try {
          const conversation = await firstValueFrom(api.post<Conversation>('/conversations', { title }));
          const existing = store.conversations();
          const list = Array.isArray(existing) ? existing : [];
          patchState(store, {
            conversations: [conversation, ...list],
            currentConversation: conversation,
            messages: [],
            loading: false,
          });
          return conversation;
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Failed to create conversation' });
          return null;
        }
      },

      async archiveConversation(id: string): Promise<void> {
        try {
          await firstValueFrom(api.patch(`/conversations/${id}`, { status: 'archived' }));
          patchState(store, {
            conversations: store.conversations().filter(c => c.id !== id),
            currentConversation: store.currentConversation()?.id === id ? null : store.currentConversation(),
          });
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Failed to archive conversation' });
        }
      },

      clearCurrentConversation(): void {
        patchState(store, { currentConversation: null, messages: [] });
      },
    };
  }),
);
