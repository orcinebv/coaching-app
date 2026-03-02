import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightsStore } from '../../core/stores/insights.store';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
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
