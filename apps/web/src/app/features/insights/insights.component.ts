import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightsStore } from '../../core/stores/insights.store';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Patronen & Inzichten</h1>
          <p>Ontdek wat je data over jou vertelt</p>
        </div>
        <button class="btn btn-primary" (click)="generate()" [disabled]="store.loading()">
          {{ store.loading() ? 'Genereren...' : '✨ Genereer inzichten' }}
        </button>
      </div>

      @if (store.loading()) {
        <div class="loading">Inzichten worden gegenereerd...</div>
      }

      @if (store.unreadCount() > 0) {
        <div class="unread-banner">
          🔔 {{ store.unreadCount() }} nieuwe inzichten
        </div>
      }

      @if (store.milestones().length > 0) {
        <section class="section">
          <h2>🏆 Mijlpalen</h2>
          <div class="insights-grid">
            @for (insight of store.milestones(); track insight.id) {
              <div class="insight-card card milestone" [class.unread]="!insight.isRead" (click)="markRead(insight.id)">
                <div class="insight-type">Mijlpaal</div>
                <h3>{{ insight.title }}</h3>
                <p>{{ insight.content }}</p>
                <div class="insight-date">{{ formatDate(insight.createdAt) }}</div>
                @if (!insight.isRead) { <div class="unread-dot"></div> }
              </div>
            }
          </div>
        </section>
      }

      @if (store.patterns().length > 0) {
        <section class="section">
          <h2>📊 Patronen</h2>
          <div class="insights-grid">
            @for (insight of store.patterns(); track insight.id) {
              <div class="insight-card card pattern" [class.unread]="!insight.isRead" (click)="markRead(insight.id)">
                <div class="insight-type">Patroon</div>
                <h3>{{ insight.title }}</h3>
                <p>{{ insight.content }}</p>
                <div class="insight-date">{{ formatDate(insight.createdAt) }}</div>
                @if (!insight.isRead) { <div class="unread-dot"></div> }
              </div>
            }
          </div>
        </section>
      }

      @if (comparisons().length > 0) {
        <section class="section">
          <h2>📈 Vergelijkingen</h2>
          <div class="insights-grid">
            @for (insight of comparisons(); track insight.id) {
              <div class="insight-card card comparison" [class.unread]="!insight.isRead" (click)="markRead(insight.id)">
                <div class="insight-type">Vergelijking</div>
                <h3>{{ insight.title }}</h3>
                <p>{{ insight.content }}</p>
                <div class="insight-date">{{ formatDate(insight.createdAt) }}</div>
                @if (!insight.isRead) { <div class="unread-dot"></div> }
              </div>
            }
          </div>
        </section>
      }

      @if (store.insights().length === 0 && !store.loading()) {
        <div class="empty-state card">
          <div class="empty-icon">💡</div>
          <h3>Nog geen inzichten</h3>
          <p>Klik op "Genereer inzichten" om je data te analyseren. Hoe meer check-ins, dagboekentries en oefeningen je hebt, hoe rijker de inzichten.</p>
          <button class="btn btn-primary" (click)="generate()">Genereer mijn eerste inzichten</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text); }
      p { color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem; }
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: var(--text-light);
      font-style: italic;
    }

    .unread-banner {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .section {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
        margin-bottom: 1rem;
      }
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .insight-card {
      position: relative;
      padding: 1.25rem;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.unread { border-left: 3px solid var(--primary); }

      &.milestone { border-top: 3px solid #f59e0b; }
      &.pattern { border-top: 3px solid var(--primary); }
      &.comparison { border-top: 3px solid #8b5cf6; }
    }

    .insight-type {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-lighter);
      margin-bottom: 0.5rem;
    }

    .insight-card h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .insight-card p {
      font-size: 0.8125rem;
      color: var(--text-light);
      line-height: 1.5;
    }

    .insight-date {
      font-size: 0.6875rem;
      color: var(--text-lighter);
      margin-top: 0.75rem;
    }

    .unread-dot {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      font-size: 0.875rem;
      color: var(--text-light);
      max-width: 400px;
      margin: 0 auto 1.5rem;
      line-height: 1.5;
    }
  `],
})
export class InsightsComponent implements OnInit {
  readonly store = inject(InsightsStore);
  readonly comparisons = computed(() => this.store.insights().filter(i => i.type === 'comparison'));

  ngOnInit(): void {
    this.store.loadInsights();
  }

  generate(): void {
    this.store.generateInsights();
  }

  markRead(id: string): void {
    this.store.markRead(id);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
