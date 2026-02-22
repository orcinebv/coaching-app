import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="error-container" [ngClass]="'error-' + type" role="alert">
      <div class="error-content">
        <span class="error-icon">{{ icon }}</span>
        <span class="error-text">{{ message }}</span>
      </div>
      <button *ngIf="dismissible" class="error-dismiss" (click)="dismiss.emit()">&times;</button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-icon {
      font-size: 1.125rem;
    }

    .error-error {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .error-warning {
      background-color: #fffbeb;
      color: #92400e;
      border: 1px solid #fed7aa;
    }

    .error-info {
      background-color: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .error-dismiss {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0 0.25rem;
    }

    .error-dismiss:hover {
      opacity: 1;
    }
  `],
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() dismissible = false;
  @Output() dismiss = new EventEmitter<void>();

  get icon(): string {
    switch (this.type) {
      case 'error': return '\u26A0';
      case 'warning': return '\u26A0';
      case 'info': return '\u2139';
      default: return '\u26A0';
    }
  }
}
