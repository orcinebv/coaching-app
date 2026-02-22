import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthStore } from '../../core/stores/auth.store';
import { ChatStore } from '../../core/stores/chat.store';
import { WebSocketService } from '../../core/services/websocket.service';
import { Conversation } from '@coaching-app/shared/types';
import { MessageListComponent } from './message-list.component';
import { MessageInputComponent } from './message-input.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent],
  template: `
    <div class="chat-layout">
      <aside class="sidebar" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <h2>Conversations</h2>
          <button class="btn btn-primary btn-sm" (click)="createConversation()">
            + New
          </button>
        </div>
        <div class="conversation-list">
          @for (conv of chatStore.conversations(); track conv.id) {
            <div
              class="conversation-item"
              [class.active]="chatStore.currentConversation()?.id === conv.id"
              (click)="selectConversation(conv)"
            >
              <div class="conv-title">{{ conv.title }}</div>
              <div class="conv-preview">{{ conv.lastMessage || 'No messages yet' }}</div>
              <div class="conv-date">{{ conv.updatedAt | date:'short' }}</div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No conversations yet</p>
              <button class="btn btn-primary btn-sm" (click)="createConversation()">
                Start your first conversation
              </button>
            </div>
          }
        </div>
      </aside>

      <div class="chat-main">
        <div class="chat-header">
          <button class="btn btn-ghost sidebar-toggle" (click)="sidebarOpen = !sidebarOpen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <h3>{{ chatStore.currentConversation()?.title || 'Select a conversation' }}</h3>
        </div>

        @if (chatStore.currentConversation()) {
          <app-message-list
            [messages]="chatStore.messages()"
            [isTyping]="isAssistantTyping"
          />
          <app-message-input
            (messageSent)="sendMessage($event)"
            (typing)="onTyping()"
            [disabled]="isSending"
          />
        } @else {
          <div class="no-conversation">
            <div class="no-conv-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-lighter)" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Welcome to Chat</h3>
              <p>Select a conversation or start a new one to begin coaching.</p>
              <button class="btn btn-primary" (click)="createConversation()">
                Start New Conversation
              </button>
            </div>
          </div>
        }
      </div>

      @if (sidebarOpen) {
        <div class="sidebar-overlay" (click)="sidebarOpen = false"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
    }

    .chat-layout {
      display: flex;
      width: 100%;
      height: calc(100vh - 60px);
      overflow: hidden;
      position: relative;
    }

    .sidebar {
      width: 320px;
      min-width: 320px;
      background-color: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      @media (max-width: 768px) {
        position: absolute;
        left: -320px;
        top: 0;
        bottom: 0;
        z-index: 20;
        transition: left 0.3s ease;

        &.sidebar-open {
          left: 0;
        }
      }
    }

    .sidebar-overlay {
      display: none;

      @media (max-width: 768px) {
        display: block;
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 15;
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .conversation-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .conversation-item {
      padding: 0.875rem 1rem;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background-color var(--transition);
      margin-bottom: 0.25rem;

      &:hover {
        background-color: var(--surface-hover);
      }

      &.active {
        background-color: var(--primary-light);
      }
    }

    .conv-title {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conv-preview {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conv-date {
      font-size: 0.6875rem;
      color: var(--text-lighter);
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-light);

      p {
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--border);
      background-color: var(--surface);

      h3 {
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .sidebar-toggle {
      display: none;
      padding: 0.375rem;

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .no-conversation {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-conv-content {
      text-align: center;
      color: var(--text-light);

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text);
        margin: 1rem 0 0.5rem;
      }

      p {
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }
    }
  `],
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  readonly chatStore = inject(ChatStore);
  private wsService = inject(WebSocketService);

  sidebarOpen = false;
  isSending = false;
  isAssistantTyping = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.chatStore.loadConversations();

    const token = this.authStore.token();
    if (token) {
      this.wsService.connect(token);
    }

    this.wsService.messages$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      this.chatStore.addMessage(message);
      this.isSending = false;
      this.isAssistantTyping = false;
    });

    this.wsService.typing$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isAssistantTyping = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
  }

  selectConversation(conversation: Conversation): void {
    this.chatStore.selectConversation(conversation.id);
    this.wsService.emit('joinConversation', { conversationId: conversation.id });
    this.sidebarOpen = false;
  }

  async createConversation(): Promise<void> {
    const conversation = await this.chatStore.createConversation('New Conversation');
    if (conversation) {
      this.wsService.emit('joinConversation', { conversationId: conversation.id });
    }
  }

  sendMessage(content: string): void {
    const conversation = this.chatStore.currentConversation();
    if (!conversation || !content.trim()) return;

    this.isSending = true;

    this.wsService.emit('sendMessage', {
      conversationId: conversation.id,
      content: content.trim(),
    });
  }

  onTyping(): void {
    this.wsService.emit('typing', { typing: true });
  }
}
