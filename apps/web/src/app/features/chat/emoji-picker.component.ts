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
  template: `
    <div class="emoji-picker">
      <div class="emoji-categories">
        @for (category of categories; track category.name) {
          <button
            class="category-btn"
            [class.active]="activeCategory === category.name"
            (click)="activeCategory = category.name"
            type="button"
          >
            {{ category.emojis[0] }}
          </button>
        }
      </div>
      <div class="emoji-grid">
        @for (category of categories; track category.name) {
          @if (activeCategory === category.name) {
            @for (emoji of category.emojis; track emoji) {
              <button
                class="emoji-btn"
                (click)="selectEmoji(emoji)"
                type="button"
              >
                {{ emoji }}
              </button>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .emoji-picker {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 1.25rem;
      width: 280px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 10;
    }

    .emoji-categories {
      display: flex;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
      gap: 0.25rem;
    }

    .category-btn {
      background: none;
      border: none;
      padding: 0.375rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      transition: background-color var(--transition);

      &:hover, &.active {
        background-color: var(--surface-hover);
      }
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      gap: 2px;
    }

    .emoji-btn {
      background: none;
      border: none;
      padding: 0.375rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 1.125rem;
      line-height: 1;
      text-align: center;
      transition: background-color var(--transition);

      &:hover {
        background-color: var(--surface-hover);
      }
    }
  `],
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
