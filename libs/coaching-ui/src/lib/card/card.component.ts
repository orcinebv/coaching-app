import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="{ 'card-hoverable': hoverable }">
      <div *ngIf="title" class="card-header">
        <h3 class="card-title">{{ title }}</h3>
        <ng-content select="[card-actions]"></ng-content>
      </div>
      <div class="card-body" [ngClass]="{ 'no-padding': noPadding }">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .card-hoverable:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border, #e5e7eb);
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text, #1f2937);
    }

    .card-body {
      padding: 1.25rem;
    }

    .card-body.no-padding {
      padding: 0;
    }
  `],
})
export class CardComponent {
  @Input() title = '';
  @Input() hoverable = false;
  @Input() noPadding = false;
}
