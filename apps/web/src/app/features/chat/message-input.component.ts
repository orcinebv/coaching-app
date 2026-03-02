import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from './emoji-picker.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiPickerComponent],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
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
