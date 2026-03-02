import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface EmojiCategory {
  name: string;
  emojis: string[];
}

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
})
export class EmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<string>();
  @Output() clickOutside = new EventEmitter<void>();

  activeCategory = 'Smileys';

  categories: EmojiCategory[] = [
    {
      name: 'Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😜', '🤪', '😝'],
    },
    {
      name: 'Gestures',
      emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🤟', '✌️', '🤞', '🫶', '❤️', '🔥', '⭐', '✨'],
    },
    {
      name: 'Emotions',
      emojis: ['😢', '😭', '😤', '😠', '🤯', '😰', '😥', '😓', '🤗', '🤔', '🫡', '🤫', '😶', '😐', '😑', '😬', '🙄', '😮', '😲', '🥱', '😴'],
    },
    {
      name: 'Nature',
      emojis: ['🌟', '🌈', '🌸', '🌺', '🌻', '🌼', '🌷', '🌱', '🌿', '🍀', '🌳', '🌊', '☀️', '🌙', '⛅', '🦋', '🐾', '🌍', '🏔️', '🌅', '🎄'],
    },
    {
      name: 'Activities',
      emojis: ['🎯', '💡', '📝', '📚', '🎓', '💻', '🏃', '🧘', '🏋️', '🚴', '🎵', '🎨', '🏆', '🎉', '🎊', '🎈', '🎁', '🗓️', '⏰', '✅', '❌'],
    },
  ];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }

  selectEmoji(emoji: string): void {
    this.emojiSelected.emit(emoji);
  }
}
