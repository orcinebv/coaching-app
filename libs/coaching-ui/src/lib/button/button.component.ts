import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="['btn', 'btn-' + variant, 'btn-' + size]"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
    .btn-md { padding: 0.5rem 1rem; font-size: 1rem; }
    .btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }

    .btn-primary {
      background-color: var(--primary, #6366f1);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-dark, #4f46e5);
    }

    .btn-secondary {
      background-color: var(--secondary, #e5e7eb);
      color: var(--text, #1f2937);
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: var(--secondary-dark, #d1d5db);
    }

    .btn-danger {
      background-color: var(--danger, #ef4444);
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      background-color: var(--danger-dark, #dc2626);
    }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
