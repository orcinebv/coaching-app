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
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
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
