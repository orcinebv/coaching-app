import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from './emoji-picker.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiPickerComponent],
  template: `
    <div class="input-container">
      <div class="input-wrapper">
        <button
          class="btn btn-ghost emoji-btn"
          (click)="showEmojiPicker = !showEmojiPicker"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>

        <textarea
          [(ngModel)]="message"
          (keydown)="onKeyDown($event)"
          (input)="onInput()"
          placeholder="Type a message..."
          [disabled]="disabled"
          rows="1"
          #inputField
        ></textarea>

        <button
          class="btn btn-primary send-btn"
          (click)="send()"
          [disabled]="disabled || !message.trim()"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      @if (showEmojiPicker) {
        <app-emoji-picker
          (emojiSelected)="onEmojiSelected($event)"
          (clickOutside)="showEmojiPicker = false"
        />
      }
    </div>
  `,
  styles: [`
    .input-container {
      padding: 0.875rem 1.25rem;
      border-top: 1px solid var(--border);
      background-color: var(--surface);
      position: relative;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      background-color: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 0.375rem;
      transition: border-color var(--transition);

      &:focus-within {
        border-color: var(--primary);
      }
    }

    textarea {
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      padding: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
      line-height: 1.5;
      max-height: 120px;
      color: var(--text);

      &:focus {
        outline: none;
        box-shadow: none;
      }

      &::placeholder {
        color: var(--text-lighter);
      }
    }

    .emoji-btn {
      padding: 0.375rem;
      color: var(--text-light);
      border-radius: var(--radius);

      &:hover {
        color: var(--text);
      }
    }

    .send-btn {
      padding: 0.5rem;
      border-radius: var(--radius);
      min-width: 36px;
      min-height: 36px;

      &:disabled {
        opacity: 0.3;
      }
    }
  `],
})
export class MessageInputComponent {
  @Input() disabled = false;
  @Output() messageSent = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();

  message = '';
  showEmojiPicker = false;

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onInput(): void {
    this.typing.emit();
  }

  send(): void {
    if (this.message.trim() && !this.disabled) {
      this.messageSent.emit(this.message.trim());
      this.message = '';
      this.showEmojiPicker = false;
    }
  }

  onEmojiSelected(emoji: string): void {
    this.message += emoji;
    this.showEmojiPicker = false;
  }
}
