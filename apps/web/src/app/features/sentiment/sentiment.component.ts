import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SentimentStore } from '../../core/stores/sentiment.store';

@Component({
  selector: 'app-sentiment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Sentiment Dashboard</h1>
        <p>Inzicht in je emotionele ontwikkeling</p>
      </div>

      @if (store.loading()) {
        <div class="loading">Laden...</div>
      }

      @if (store.summary(); as summary) {
        <div class="summary-grid">
          <div class="summary-card card" [class.crisis]="summary.crisisDetected">
            <div class="card-label">Gemiddeld sentiment</div>
            <div class="card-value" [class.positive]="(summary.avgOverall ?? 0) > 0" [class.negative]="(summary.avgOverall ?? 0) < 0">
              @if (summary.avgOverall !== null) {
                {{ summary.avgOverall > 0 ? '+' : '' }}{{ summary.avgOverall.toFixed(2) }}
              } @else {
                –
              }
            </div>
            <div class="card-sub">schaal -1 tot +1</div>
          </div>

          <div class="summary-card card">
            <div class="card-label">Trend</div>
            <div class="card-value trend" [class.up]="summary.trend === 'improving'" [class.down]="summary.trend === 'declining'">
              @if (summary.trend === 'improving') { ↑ Verbeterend }
              @else if (summary.trend === 'declining') { ↓ Dalend }
              @else { → Stabiel }
            </div>
            <div class="card-sub">{{ summary.totalAnalyses }} analyses</div>
          </div>

          <div class="summary-card card">
            <div class="card-label">Dominante emotie</div>
            <div class="card-value emotion">
              {{ getEmotionLabel(summary.dominantEmotion) }}
            </div>
            <div class="card-sub">afgelopen 30 dagen</div>
          </div>

          @if (summary.crisisDetected) {
            <div class="crisis-alert card">
              <div class="crisis-title">⚠️ Crisissignaal gedetecteerd</div>
              <p>Er zijn zorgwekkende signalen in je berichten. Als je je overweldigd voelt, neem dan contact op met een professional of bel 0800-0113 (Stichting 113 Zelfmoordpreventie).</p>
            </div>
          }
        </div>
      }

      <div class="section card">
        <div class="section-header">
          <h2>Sentimentgeschiedenis</h2>
          <div class="period-filter">
            <button class="btn btn-sm" [class.btn-primary]="selectedDays === 7" (click)="loadHistory(7)">7 dagen</button>
            <button class="btn btn-sm" [class.btn-primary]="selectedDays === 30" (click)="loadHistory(30)">30 dagen</button>
            <button class="btn btn-sm" [class.btn-primary]="selectedDays === 90" (click)="loadHistory(90)">90 dagen</button>
          </div>
        </div>

        @if (store.history().length === 0) {
          <div class="empty-state">
            <p>Nog geen sentimentdata. Schrijf dagboekentries om je sentiment bij te houden.</p>
            <a routerLink="/journal" class="btn btn-primary btn-sm">Naar dagboek</a>
          </div>
        } @else {
          <div class="chart">
            @for (item of store.history(); track item.id) {
              <div class="chart-bar-wrapper" [title]="formatDate(item.createdAt)">
                <div class="chart-bar" [style.height.%]="getBarHeight(item.overall)" [class.positive]="item.overall >= 0" [class.negative]="item.overall < 0" [class.crisis]="item.crisis"></div>
              </div>
            }
          </div>
          <div class="chart-legend">
            <span class="legend-item positive">Positief</span>
            <span class="legend-item negative">Negatief</span>
            <span class="legend-item crisis">Crisis</span>
          </div>

          <div class="history-list">
            @for (item of store.history().slice().reverse().slice(0, 5); track item.id) {
              <div class="history-item">
                <div class="history-date">{{ formatDate(item.createdAt) }}</div>
                <div class="history-emotions">
                  @for (emotion of getTopEmotions(item.emotions); track emotion.name) {
                    <span class="emotion-tag">{{ emotion.label }}: {{ (emotion.score * 100).toFixed(0) }}%</span>
                  }
                </div>
                <div class="history-overall" [class.positive]="item.overall >= 0" [class.negative]="item.overall < 0">
                  {{ item.overall > 0 ? '+' : '' }}{{ item.overall.toFixed(2) }}
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text); }
      p { color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem; }
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      text-align: center;
      padding: 1.25rem;

      &.crisis { border-color: #ef4444; background: #fef2f2; }
    }

    .card-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-lighter);
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.25rem;

      &.positive { color: #16a34a; }
      &.negative { color: #dc2626; }

      &.trend {
        font-size: 1.125rem;
        &.up { color: #16a34a; }
        &.down { color: #dc2626; }
      }

      &.emotion { font-size: 1.25rem; }
    }

    .card-sub {
      font-size: 0.75rem;
      color: var(--text-lighter);
    }

    .crisis-alert {
      grid-column: 1 / -1;
      background: #fef2f2;
      border: 1px solid #ef4444;
      padding: 1rem;

      .crisis-title {
        font-weight: 600;
        color: #dc2626;
        margin-bottom: 0.5rem;
      }

      p { font-size: 0.875rem; color: var(--text); line-height: 1.5; }
    }

    .section {
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h2 { font-size: 1.125rem; font-weight: 600; }
    }

    .period-filter {
      display: flex;
      gap: 0.5rem;
    }

    .chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 120px;
      background: var(--bg);
      border-radius: var(--radius);
      padding: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .chart-bar-wrapper {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .chart-bar {
      width: 100%;
      border-radius: 2px;
      min-height: 2px;
      transition: opacity 0.2s;

      &.positive { background: #16a34a; }
      &.negative { background: #dc2626; }
      &.crisis { background: #7c3aed; }

      &:hover { opacity: 0.8; }
    }

    .chart-legend {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--text-light);

      &::before {
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      &.positive::before { background: #16a34a; }
      &.negative::before { background: #dc2626; }
      &.crisis::before { background: #7c3aed; }
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--bg);
      border-radius: var(--radius);
    }

    .history-date {
      font-size: 0.75rem;
      color: var(--text-light);
      min-width: 100px;
    }

    .history-emotions {
      flex: 1;
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }

    .emotion-tag {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 100px;
      background: var(--primary-light);
      color: var(--primary);
    }

    .history-overall {
      font-weight: 600;
      font-size: 0.875rem;
      min-width: 50px;
      text-align: right;

      &.positive { color: #16a34a; }
      &.negative { color: #dc2626; }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-light);
      p { margin-bottom: 1rem; font-size: 0.875rem; }
    }
  `],
})
export class SentimentComponent implements OnInit {
  readonly store = inject(SentimentStore);
  selectedDays = 30;

  ngOnInit(): void {
    this.store.loadHistory(30);
    this.store.loadSummary();
  }

  loadHistory(days: number): void {
    this.selectedDays = days;
    this.store.loadHistory(days);
  }

  getEmotionLabel(emotion: string | null): string {
    const labels: Record<string, string> = {
      joy: 'Vreugde',
      sadness: 'Verdriet',
      anger: 'Boosheid',
      fear: 'Angst',
      surprise: 'Verrassing',
    };
    return emotion ? (labels[emotion] || emotion) : '–';
  }

  getBarHeight(overall: number): number {
    return Math.abs(overall) * 100;
  }

  getTopEmotions(emotions: any): { name: string; label: string; score: number }[] {
    const labels: Record<string, string> = {
      joy: 'Vreugde', sadness: 'Verdriet', anger: 'Boosheid', fear: 'Angst', surprise: 'Verrassing',
    };
    return Object.entries(emotions || {})
      .map(([name, score]) => ({ name, label: labels[name] || name, score: score as number }))
      .filter(e => e.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  }
}
