import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, BarChart2, Target, BookOpen, Activity, Star, Zap } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { MoodPatterns, ProgressSummary } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  readonly BarChart2Icon = BarChart2;
  readonly TargetIcon = Target;
  readonly BookOpenIcon = BookOpen;
  readonly ActivityIcon = Activity;
  readonly StarIcon = Star;
  readonly ZapIcon = Zap;

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
      this.cdr.detectChanges();
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
