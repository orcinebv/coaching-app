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
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
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
