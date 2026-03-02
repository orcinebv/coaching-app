import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly checkInStore = inject(CheckInStore);
  readonly chatStore = inject(ChatStore);
  readonly promptsStore = inject(PromptsStore);
  readonly recommendationsStore = inject(RecommendationsStore);
  readonly insightsStore = inject(InsightsStore);
  private cdr = inject(ChangeDetectorRef);
  isInitialLoad = signal(true);

  ngOnInit(): void {
    Promise.all([
      this.checkInStore.loadStats(),
      this.checkInStore.loadCheckIns(),
      this.chatStore.loadConversations(),
      this.promptsStore.loadDailyPrompt(),
      this.recommendationsStore.loadRecommendations(),
      this.insightsStore.loadInsights(),
    ]).finally(() => {
      this.isInitialLoad.set(false);
      this.cdr.markForCheck();
    });
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
