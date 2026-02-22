import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { MoodPatterns, ProgressSummary } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Inzicht in je patronen en voortgang</p>
      </div>

      @if (loading) {
        <div class="loading-state">
          <span class="spinner spinner--dark"></span>
          <span>Analyseren...</span>
        </div>
      }

      @if (summary) {
        <div class="summary-grid">
          <div class="card summary-card">
            <div class="summary-icon">📊</div>
            <div class="summary-info">
              <div class="summary-num">{{ summary.checkIns.total }}</div>
              <div class="summary-label">Check-ins</div>
            </div>
            <div class="summary-sub">
              Gem. stemming: <strong>{{ summary.checkIns.avgMood }}/10</strong>
            </div>
          </div>
          <div class="card summary-card">
            <div class="summary-icon">🎯</div>
            <div class="summary-info">
              <div class="summary-num">{{ summary.goals.completed }}/{{ summary.goals.total }}</div>
              <div class="summary-label">Doelen</div>
            </div>
            <div class="summary-sub">
              <strong>{{ summary.goals.active }}</strong> actief
            </div>
          </div>
          <div class="card summary-card">
            <div class="summary-icon">📔</div>
            <div class="summary-info">
              <div class="summary-num">{{ summary.journal.total }}</div>
              <div class="summary-label">Dagboek entries</div>
            </div>
          </div>
          <div class="card summary-card">
            <div class="summary-icon">🧘</div>
            <div class="summary-info">
              <div class="summary-num">{{ summary.exercises.total }}</div>
              <div class="summary-label">Oefeningen gedaan</div>
            </div>
          </div>
        </div>
      }

      @if (patterns) {
        <div class="patterns-section">
          <div class="card pattern-card">
            <h2>Stemming per weekdag</h2>
            @if (patterns.insights.bestDay) {
              <div class="insights-row">
                <div class="insight insight--best">
                  <span class="insight-icon">🌟</span>
                  <span>Beste dag: <strong>{{ patterns.insights.bestDay }}</strong></span>
                </div>
                @if (patterns.insights.worstDay) {
                  <div class="insight insight--worst">
                    <span class="insight-icon">💪</span>
                    <span>Aandacht: <strong>{{ patterns.insights.worstDay }}</strong></span>
                  </div>
                }
              </div>
            }

            <div class="weekday-chart">
              @for (day of patterns.weekdayAverages; track day.day) {
                <div class="day-bar">
                  <div class="bar-container">
                    <div
                      class="bar mood-bar"
                      [style.height.%]="(day.avgMood || 0) * 10"
                      [title]="'Stemming: ' + day.avgMood"
                    ></div>
                    <div
                      class="bar energy-bar"
                      [style.height.%]="(day.avgEnergy || 0) * 10"
                      [title]="'Energie: ' + day.avgEnergy"
                    ></div>
                  </div>
                  <div class="day-label">{{ day.day.substring(0, 2) }}</div>
                  @if (day.avgMood) {
                    <div class="day-value">{{ day.avgMood }}</div>
                  }
                </div>
              }
            </div>

            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot mood-dot"></span> Stemming</span>
              <span class="legend-item"><span class="legend-dot energy-dot"></span> Energie</span>
            </div>
          </div>

          @if (patterns.correlation !== null) {
            <div class="card correlation-card">
              <h2>Stemming ↔ Energie correlatie</h2>
              <div class="correlation-display">
                <div class="correlation-value" [class]="getCorrelationClass(patterns.correlation)">
                  {{ (patterns.correlation * 100).toFixed(0) }}%
                </div>
                <div class="correlation-label">{{ getCorrelationLabel(patterns.correlation) }}</div>
              </div>
              <p class="correlation-desc">
                {{ getCorrelationDescription(patterns.correlation) }}
              </p>
              <div class="data-points">
                Gebaseerd op <strong>{{ patterns.insights.totalDataPoints }}</strong> check-ins
              </div>
            </div>
          }
        </div>

        @if (patterns.trendData && patterns.trendData.length > 0) {
          <div class="card trend-card">
            <h2>30-daagse trend</h2>
            <div class="trend-chart">
              @for (point of patterns.trendData.slice(-14); track point.date) {
                <div class="trend-point">
                  <div class="trend-bars">
                    <div class="trend-bar mood-bar-mini" [style.height.%]="point.mood * 10" [title]="'Stemming: ' + point.mood"></div>
                    <div class="trend-bar energy-bar-mini" [style.height.%]="point.energy * 10" [title]="'Energie: ' + point.energy"></div>
                  </div>
                  <div class="trend-date">{{ point.date | date:'d/M' }}</div>
                </div>
              }
            </div>
          </div>
        }
      }

      @if (!loading && !patterns && !summary) {
        <div class="empty-state card">
          <div class="empty-icon">📊</div>
          <h3>Geen data beschikbaar</h3>
          <p>Maak meer check-ins om patronen te ontdekken.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-page {
      padding: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .page-header p {
      color: var(--text-light);
      font-size: 0.875rem;
      margin: 0.25rem 0 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .summary-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .summary-icon { font-size: 1.5rem; }

    .summary-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .summary-num {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
    }

    .summary-label {
      font-size: 0.8125rem;
      color: var(--text-light);
    }

    .summary-sub {
      font-size: 0.75rem;
      color: var(--text-lighter);
    }

    .patterns-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .pattern-card, .correlation-card, .trend-card {
      padding: 1.25rem;

      h2 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 1rem;
      }
    }

    .insights-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .insight {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-light);
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius);

      &.insight--best { background: #d1fae5; color: #065f46; }
      &.insight--worst { background: #fef3c7; color: #92400e; }
    }

    .weekday-chart {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      height: 120px;
      padding-bottom: 24px;
    }

    .day-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      position: relative;
    }

    .bar-container {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      flex: 1;
      width: 100%;
    }

    .bar {
      flex: 1;
      border-radius: 3px 3px 0 0;
      min-height: 2px;
      transition: height 0.3s ease;
    }

    .mood-bar { background: var(--primary); }
    .energy-bar { background: var(--secondary, #10B981); }

    .day-label {
      font-size: 0.6875rem;
      color: var(--text-lighter);
      position: absolute;
      bottom: 10px;
    }

    .day-value {
      font-size: 0.625rem;
      color: var(--text-light);
      font-weight: 600;
    }

    .chart-legend {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .mood-dot { background: var(--primary); }
    .energy-dot { background: var(--secondary, #10B981); }

    .correlation-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 1rem 0;
    }

    .correlation-value {
      font-size: 2.5rem;
      font-weight: 700;

      &.corr--high { color: #10B981; }
      &.corr--medium { color: #F59E0B; }
      &.corr--low { color: var(--text-light); }
    }

    .correlation-label {
      font-size: 0.875rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }

    .correlation-desc {
      font-size: 0.8125rem;
      color: var(--text-light);
      line-height: 1.5;
      text-align: center;
      margin: 0 0 0.75rem;
    }

    .data-points {
      font-size: 0.75rem;
      color: var(--text-lighter);
      text-align: center;
    }

    .trend-chart {
      display: flex;
      align-items: flex-end;
      gap: 0.375rem;
      height: 80px;
      padding-bottom: 20px;
    }

    .trend-point {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      position: relative;
    }

    .trend-bars {
      display: flex;
      gap: 1px;
      align-items: flex-end;
      flex: 1;
      width: 100%;
    }

    .trend-bar {
      flex: 1;
      border-radius: 2px 2px 0 0;
      min-height: 2px;
    }

    .mood-bar-mini { background: var(--primary); opacity: 0.8; }
    .energy-bar-mini { background: var(--secondary, #10B981); opacity: 0.8; }

    .trend-date {
      position: absolute;
      bottom: 0;
      font-size: 0.5rem;
      color: var(--text-lighter);
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;

      .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
      h3 { font-size: 1.125rem; font-weight: 600; color: var(--text); margin: 0 0 0.5rem; }
      p { color: var(--text-light); font-size: 0.875rem; margin: 0; }
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-light);
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .spinner--dark {
      border-color: var(--border);
      border-top-color: var(--primary);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);

  loading = false;
  patterns: MoodPatterns | null = null;
  summary: ProgressSummary | null = null;

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const [patterns, summary] = await Promise.all([
        firstValueFrom(this.api.get<MoodPatterns>('/analytics/mood-patterns')),
        firstValueFrom(this.api.get<ProgressSummary>('/analytics/progress-summary')),
      ]);
      this.patterns = patterns;
      this.summary = summary;
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      this.loading = false;
    }
  }

  getCorrelationClass(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 0.7) return 'corr--high';
    if (abs >= 0.4) return 'corr--medium';
    return 'corr--low';
  }

  getCorrelationLabel(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 0.7) return 'Sterke correlatie';
    if (abs >= 0.4) return 'Matige correlatie';
    return 'Zwakke correlatie';
  }

  getCorrelationDescription(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 0.7) {
      return value > 0
        ? 'Je stemming en energieniveau zijn sterk met elkaar verbonden.'
        : 'Je stemming en energieniveau bewegen tegengesteld aan elkaar.';
    }
    if (abs >= 0.4) {
      return 'Er is een matig verband tussen je stemming en energieniveau.';
    }
    return 'Je stemming en energieniveau zijn relatief onafhankelijk van elkaar.';
  }
}
