import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, AlertTriangle } from 'lucide-angular';
import { SentimentStore } from '../../core/stores/sentiment.store';

@Component({
  selector: 'app-sentiment',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.scss'],
})
export class SentimentComponent implements OnInit {
  readonly store = inject(SentimentStore);
  readonly AlertTriangleIcon = AlertTriangle;
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
