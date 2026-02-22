import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../core/services/state.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-list" #scrollContainer>
      @for (message of messages; track message.id) {
        <div class="message" [class.user]="message.role === 'user'" [class.assistant]="message.role === 'assistant'">
          @if (message.role === 'assistant') {
            <div class="avatar assistant-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm4 10H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2z"/>
              </svg>
            </div>
          }
          <div class="bubble">
            <div class="content">{{ message.content }}</div>
            <div class="timestamp">{{ message.createdAt | date:'shortTime' }}</div>
          </div>
        </div>
      } @empty {
        <div class="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      }

      @if (isTyping) {
        <div class="message assistant">
          <div class="avatar assistant-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm4 10H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <div class="bubble typing-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      display: flex;
      gap: 0.625rem;
      max-width: 80%;

      &.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      &.assistant {
        align-self: flex-start;
      }
    }

    .avatar {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }

    .assistant-avatar {
      background-color: var(--secondary-light);
      color: var(--secondary);
    }

    .bubble {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-lg);
      line-height: 1.5;
      font-size: 0.875rem;

      .user & {
        background-color: var(--primary);
        color: #fff;
        border-bottom-right-radius: 4px;
      }

      .assistant & {
        background-color: var(--surface-hover);
        color: var(--text);
        border-bottom-left-radius: 4px;
      }
    }

    .content {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .timestamp {
      font-size: 0.6875rem;
      margin-top: 0.375rem;
      opacity: 0.7;

      .user & {
        text-align: right;
      }
    }

    .empty-messages {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .typing-bubble {
      padding: 0.875rem 1.25rem;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;

      span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--text-lighter);
        animation: typing 1.4s ease-in-out infinite;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-6px);
        opacity: 1;
      }
    }
  `],
})
export class MessageListComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() isTyping = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private shouldScroll = true;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {
      // element not yet available
    }
  }
}
