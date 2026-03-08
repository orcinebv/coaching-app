import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sparkles, Bell, Trophy, BarChart2, TrendingUp, Lightbulb } from 'lucide-angular';
import { InsightsStore } from '../../core/stores/insights.store';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
})
export class InsightsComponent implements OnInit {
  readonly store = inject(InsightsStore);
  readonly comparisons = computed(() => this.store.insights().filter(i => i.type === 'comparison'));

  readonly SparklesIcon = Sparkles;
  readonly BellIcon = Bell;
  readonly TrophyIcon = Trophy;
  readonly BarChart2Icon = BarChart2;
  readonly TrendingUpIcon = TrendingUp;
  readonly LightbulbIcon = Lightbulb;

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
