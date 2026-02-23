import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckInStore } from '../../core/stores/checkin.store';
import { ChatStore } from '../../core/stores/chat.store';
import { PromptsStore } from '../../core/stores/prompts.store';
import { RecommendationsStore } from '../../core/stores/recommendations.store';
import { InsightsStore } from '../../core/stores/insights.store';
import { StatsCardComponent } from './stats-card.component';
import { MoodChartComponent } from './mood-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsCardComponent, MoodChartComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overzicht van je coaching voortgang</p>
      </div>

      <div class="stats-grid">
        <app-stats-card
          title="Gesprekken"
          [value]="checkInStore.stats()?.totalConversations ?? 0"
          icon="chat"
          trend="neutral"
        />
        <app-stats-card
          title="Check-ins"
          [value]="checkInStore.totalCheckIns()"
          icon="checkin"
          trend="up"
        />
        <app-stats-card
          title="Gem. Stemming"
          [value]="checkInStore.averageMood()"
          icon="mood"
          trend="up"
        />
        <app-stats-card
          title="Streak"
          [value]="checkInStore.currentStreak()"
          icon="streak"
          trend="up"
        />
      </div>

      <!-- Daily Prompt Widget -->
      @if (promptsStore.dailyPrompt(); as prompt) {
        <div class="prompt-widget card" [class.skipped]="prompt.skipped">
          <div class="prompt-header">
            <div class="prompt-label">
              <span class="prompt-icon">💭</span>
              Dagelijkse coaching vraag
              <span class="prompt-type-badge">{{ getPromptTypeLabel(prompt.type) }}</span>
            </div>
            @if (!prompt.skipped) {
              <button class="btn-icon" title="Overslaan" (click)="skipPrompt(prompt.id)">✕</button>
            }
          </div>
          <p class="prompt-text">{{ prompt.prompt }}</p>
          @if (!prompt.skipped && !prompt.rating) {
            <div class="prompt-actions">
              <a [routerLink]="['/journal']" class="btn btn-primary btn-sm">Beantwoorden in dagboek</a>
              <div class="prompt-rating">
                <span class="rating-label">Goede vraag?</span>
                @for (star of [1,2,3,4,5]; track star) {
                  <button class="star-btn" (click)="ratePrompt(prompt.id, star)">★</button>
                }
              </div>
            </div>
          }
          @if (prompt.rating) {
            <div class="prompt-rated">Bedankt voor je feedback! ⭐ {{ prompt.rating }}/5</div>
          }
        </div>
      }

      <div class="dashboard-grid">
        <div class="main-col">
          <div class="chart-section card">
            <h2>Stemming & Energie Trends</h2>
            <app-mood-chart [chartData]="checkInStore.chartData()" />
          </div>

          <!-- Insights preview -->
          @if (insightsStore.insights().length > 0) {
            <div class="insights-preview card">
              <div class="section-header">
                <h2>
                  Recente inzichten
                  @if (insightsStore.unreadCount() > 0) {
                    <span class="badge">{{ insightsStore.unreadCount() }}</span>
                  }
                </h2>
                <a routerLink="/insights" class="link">Alle inzichten →</a>
              </div>
              <div class="insights-list">
                @for (insight of insightsStore.insights().slice(0, 3); track insight.id) {
                  <div class="insight-item" [class.unread]="!insight.isRead" (click)="insightsStore.markRead(insight.id)">
                    <span class="insight-icon">{{ getInsightIcon(insight.type) }}</span>
                    <div>
                      <div class="insight-title">{{ insight.title }}</div>
                      <div class="insight-content">{{ insight.content }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="side-col">
          <!-- Recommendations Widget -->
          <div class="recommendations-card card">
            <div class="section-header">
              <h2>Aanbevelingen</h2>
              <a routerLink="/exercises" class="link">Meer →</a>
            </div>

            @if (recommendationsStore.loading()) {
              <div class="loading-sm">Laden...</div>
            } @else if (recommendationsStore.recommendations().length === 0) {
              <div class="empty-sm">
                <p>Doe een check-in voor gepersonaliseerde aanbevelingen</p>
                <a routerLink="/checkin" class="btn btn-primary btn-sm">Check-in doen</a>
              </div>
            } @else {
              <div class="reco-list">
                @for (reco of recommendationsStore.recommendations().slice(0, 3); track reco.id) {
                  <div class="reco-item">
                    <div class="reco-info">
                      <div class="reco-title">{{ reco.title }}</div>
                      <div class="reco-reason">{{ reco.reason }}</div>
                      @if (reco.exercise) {
                        <div class="reco-meta">{{ reco.exercise.duration }} min · {{ reco.exercise.difficulty }}</div>
                      }
                    </div>
                    <div class="reco-actions">
                      <button class="btn-icon" title="Nuttig" (click)="recoFeedback(reco.id, true)">👍</button>
                      <button class="btn-icon" title="Niet nuttig" (click)="recoFeedback(reco.id, false)">👎</button>
                      <button class="btn-icon" title="Verwijderen" (click)="dismissReco(reco.id)">✕</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Recent check-ins -->
          <div class="checkins-section card">
            <div class="section-header">
              <h2>Recente Check-ins</h2>
              <a routerLink="/checkin" class="btn btn-primary btn-sm">Nieuw</a>
            </div>

            <div class="checkin-list">
              @for (checkin of checkInStore.recentCheckIns(); track checkin.id) {
                <div class="checkin-item">
                  <div class="checkin-date">{{ checkin.createdAt | date:'mediumDate' }}</div>
                  <div class="checkin-metrics">
                    <span class="metric mood">
                      <span class="metric-label">Stemming</span>
                      <span class="metric-value">{{ checkin.mood }}/10</span>
                    </span>
                    <span class="metric energy">
                      <span class="metric-label">Energie</span>
                      <span class="metric-value">{{ checkin.energy }}/10</span>
                    </span>
                  </div>
                  @if (checkin.notes) {
                    <div class="checkin-notes">{{ checkin.notes }}</div>
                  }
                </div>
              } @empty {
                <div class="empty-state">
                  <p>Nog geen check-ins.</p>
                  <a routerLink="/checkin" class="btn btn-primary btn-sm">Eerste check-in doen</a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text); }
      p { color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .prompt-widget {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      border-left: 4px solid var(--primary);

      &.skipped { opacity: 0.6; border-left-color: var(--border); }
    }

    .prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .prompt-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-lighter);
    }

    .prompt-icon { font-size: 1rem; }

    .prompt-type-badge {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.125rem 0.5rem;
      border-radius: 100px;
      font-size: 0.625rem;
    }

    .prompt-text {
      font-size: 1.0625rem;
      color: var(--text);
      line-height: 1.5;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .prompt-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .prompt-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .rating-label {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-right: 0.25rem;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-lighter);
      font-size: 1.125rem;
      padding: 0.125rem;
      transition: color var(--transition);

      &:hover { color: #f59e0b; }
    }

    .prompt-rated {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-lighter);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      transition: all var(--transition);

      &:hover { background: var(--surface-hover); color: var(--text); }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 1024px) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .main-col, .side-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .chart-section h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .badge {
      background: var(--primary);
      color: #fff;
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 100px;
      font-weight: 700;
    }

    .link {
      font-size: 0.8125rem;
      color: var(--primary);
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .insight-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg);
      border-radius: var(--radius);
      cursor: pointer;
      transition: background var(--transition);

      &.unread { background: var(--primary-light); }
      &:hover { background: var(--surface-hover); }
    }

    .insight-icon { font-size: 1.25rem; flex-shrink: 0; }

    .insight-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .insight-content {
      font-size: 0.75rem;
      color: var(--text-light);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .reco-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .reco-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg);
      border-radius: var(--radius);
    }

    .reco-info { flex: 1; }

    .reco-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .reco-reason {
      font-size: 0.75rem;
      color: var(--text-light);
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }

    .reco-meta {
      font-size: 0.6875rem;
      color: var(--text-lighter);
    }

    .reco-actions {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .loading-sm, .empty-sm {
      text-align: center;
      padding: 1.5rem;
      color: var(--text-light);
      font-size: 0.875rem;
      p { margin-bottom: 0.75rem; }
    }

    .checkin-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkin-item {
      padding: 0.875rem;
      background-color: var(--bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    .checkin-date {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }

    .checkin-metrics {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .metric-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-lighter);
    }

    .metric-value {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .mood .metric-value { color: var(--primary); }
    .energy .metric-value { color: var(--secondary); }

    .checkin-notes {
      font-size: 0.8125rem;
      color: var(--text-light);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-light);
      font-size: 0.875rem;
      p { margin-bottom: 1rem; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly checkInStore = inject(CheckInStore);
  readonly chatStore = inject(ChatStore);
  readonly promptsStore = inject(PromptsStore);
  readonly recommendationsStore = inject(RecommendationsStore);
  readonly insightsStore = inject(InsightsStore);

  ngOnInit(): void {
    this.checkInStore.loadStats();
    this.checkInStore.loadCheckIns();
    this.chatStore.loadConversations();
    this.promptsStore.loadDailyPrompt();
    this.recommendationsStore.loadRecommendations();
    this.insightsStore.loadInsights();
  }

  skipPrompt(id: string): void {
    this.promptsStore.skipPrompt(id);
  }

  ratePrompt(id: string, rating: number): void {
    this.promptsStore.ratePrompt(id, rating);
  }

  recoFeedback(id: string, helpful: boolean): void {
    this.recommendationsStore.giveFeedback(id, helpful);
  }

  dismissReco(id: string): void {
    this.recommendationsStore.dismiss(id);
  }

  getPromptTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      reflection: 'Reflectie',
      goal: 'Doelen',
      gratitude: 'Dankbaarheid',
      challenge: 'Uitdaging',
    };
    return labels[type] || type;
  }

  getInsightIcon(type: string): string {
    const icons: Record<string, string> = {
      milestone: '🏆',
      pattern: '📊',
      comparison: '📈',
      encouragement: '💪',
    };
    return icons[type] || '💡';
  }
}
