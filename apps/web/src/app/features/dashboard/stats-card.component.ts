import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card">
      <div class="card-icon" [ngClass]="'icon-' + icon">
        @switch (icon) {
          @case ('chat') {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
          @case ('checkin') {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
          @case ('mood') {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          }
          @case ('streak') {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          }
        }
      </div>
      <div class="card-content">
        <div class="card-value">{{ value }}</div>
        <div class="card-title">{{ title }}</div>
      </div>
      <div class="card-trend" [ngClass]="'trend-' + trend">
        @switch (trend) {
          @case ('up') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          }
          @case ('down') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          }
          @case ('neutral') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      background-color: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      position: relative;
      overflow: hidden;
    }

    .card-icon {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;

      &.icon-chat {
        background-color: var(--primary-light);
        color: var(--primary);
      }

      &.icon-checkin {
        background-color: var(--secondary-light);
        color: var(--secondary);
      }

      &.icon-mood {
        background-color: var(--warning-light);
        color: var(--warning);
      }

      &.icon-streak {
        background-color: var(--danger-light);
        color: var(--danger);
      }
    }

    .card-content {
      flex: 1;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.2;
    }

    .card-title {
      font-size: 0.8125rem;
      color: var(--text-light);
      margin-top: 0.125rem;
    }

    .card-trend {
      position: absolute;
      top: 1rem;
      right: 1rem;

      &.trend-up {
        color: var(--secondary);
      }

      &.trend-down {
        color: var(--danger);
      }

      &.trend-neutral {
        color: var(--text-lighter);
      }
    }
  `],
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() icon: 'chat' | 'checkin' | 'mood' | 'streak' = 'chat';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
}
