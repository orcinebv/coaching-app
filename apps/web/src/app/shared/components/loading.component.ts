import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading" [ngClass]="'loading-' + size">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      border-radius: 50%;
      border-style: solid;
      border-color: var(--border);
      border-top-color: var(--primary);
      animation: spin 0.7s linear infinite;
    }

    .loading-sm .spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .loading-md .spinner {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    .loading-lg .spinner {
      width: 48px;
      height: 48px;
      border-width: 4px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
