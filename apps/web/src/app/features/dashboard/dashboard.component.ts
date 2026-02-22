import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckInStore } from '../../core/stores/checkin.store';
import { ChatStore } from '../../core/stores/chat.store';
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
        <p>Track your coaching progress and well-being</p>
      </div>

      <div class="stats-grid">
        <app-stats-card
          title="Conversations"
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
          title="Avg Mood"
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

      <div class="dashboard-grid">
        <div class="chart-section card">
          <h2>Mood & Energy Trends</h2>
          <app-mood-chart [chartData]="checkInStore.chartData()" />
        </div>

        <div class="checkins-section card">
          <div class="section-header">
            <h2>Recent Check-ins</h2>
            <a routerLink="/checkin" class="btn btn-primary btn-sm">New Check-in</a>
          </div>

          <div class="checkin-list">
            @for (checkin of checkInStore.recentCheckIns(); track checkin.id) {
              <div class="checkin-item">
                <div class="checkin-date">{{ checkin.createdAt | date:'mediumDate' }}</div>
                <div class="checkin-metrics">
                  <span class="metric mood">
                    <span class="metric-label">Mood</span>
                    <span class="metric-value">{{ checkin.mood }}/10</span>
                  </span>
                  <span class="metric energy">
                    <span class="metric-label">Energy</span>
                    <span class="metric-value">{{ checkin.energy }}/10</span>
                  </span>
                </div>
                @if (checkin.notes) {
                  <div class="checkin-notes">{{ checkin.notes }}</div>
                }
              </div>
            } @empty {
              <div class="empty-state">
                <p>No check-ins yet.</p>
                <a routerLink="/checkin" class="btn btn-primary btn-sm">Create your first check-in</a>
              </div>
            }
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

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text);
      }

      p {
        color: var(--text-light);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 1024px) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .chart-section {
      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
    }

    .checkins-section {
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;

        h2 {
          font-size: 1.125rem;
          font-weight: 600;
        }
      }
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

    .mood .metric-value {
      color: var(--primary);
    }

    .energy .metric-value {
      color: var(--secondary);
    }

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

      p {
        margin-bottom: 1rem;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly checkInStore = inject(CheckInStore);
  readonly chatStore = inject(ChatStore);

  ngOnInit(): void {
    this.checkInStore.loadStats();
    this.checkInStore.loadCheckIns();
    this.chatStore.loadConversations();
  }
}
