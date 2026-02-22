import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ExercisesStore } from '../../core/stores/exercises.store';
import { Exercise } from '@coaching-app/shared/types';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="exercises-page">
      <div class="page-header">
        <h1>Oefeningen</h1>
        <p>Zelfhulp oefeningen voor mentale gezondheid en welzijn</p>
      </div>

      <div class="stats-bar card">
        <div class="stat-item">
          <span class="stat-num">{{ exercisesStore.stats()?.total ?? 0 }}</span>
          <span class="stat-lbl">Voltooid</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ exercisesStore.stats()?.totalMinutes ?? 0 }}</span>
          <span class="stat-lbl">Minuten</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ exercisesStore.stats()?.avgRating ?? 0 }}</span>
          <span class="stat-lbl">Gem. beoordeling</span>
        </div>
      </div>

      <div class="category-filter">
        <button
          class="filter-btn"
          [class.filter-btn--active]="!exercisesStore.selectedCategory()"
          (click)="exercisesStore.setCategory(null)"
        >
          Alle
        </button>
        @for (cat of exercisesStore.categories(); track cat) {
          <button
            class="filter-btn"
            [class.filter-btn--active]="exercisesStore.selectedCategory() === cat"
            (click)="exercisesStore.setCategory(cat)"
          >
            {{ getCategoryIcon(cat) }} {{ getCategoryLabel(cat) }}
          </button>
        }
      </div>

      @if (exercisesStore.loading()) {
        <div class="loading-state">
          <span class="spinner spinner--dark"></span>
        </div>
      }

      <div class="exercises-grid">
        @for (exercise of exercisesStore.filteredExercises(); track exercise.id) {
          <div class="card exercise-card" [class.exercise-card--active]="selectedExercise?.id === exercise.id">
            <div class="exercise-header">
              <div class="exercise-meta">
                <span class="category-tag" [attr.data-cat]="exercise.category">
                  {{ getCategoryIcon(exercise.category) }} {{ getCategoryLabel(exercise.category) }}
                </span>
                <span class="difficulty-badge" [class]="'difficulty--' + exercise.difficulty">
                  {{ getDifficultyLabel(exercise.difficulty) }}
                </span>
              </div>
              <div class="duration-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ exercise.duration }} min
              </div>
            </div>

            <h3 class="exercise-title">{{ exercise.title }}</h3>
            <p class="exercise-desc">{{ exercise.description }}</p>

            <div class="benefits-list">
              @for (benefit of exercise.benefits.slice(0, 2); track benefit) {
                <span class="benefit-item">✓ {{ benefit }}</span>
              }
            </div>

            @if (selectedExercise?.id === exercise.id) {
              <div class="exercise-detail">
                <h4>Stappen:</h4>
                <ol class="steps-list">
                  @for (step of exercise.steps; track $index) {
                    <li>{{ step }}</li>
                  }
                </ol>

                @if (showCompleteForm) {
                  <div class="complete-form">
                    <div class="rating-section">
                      <label>Beoordeling (optioneel)</label>
                      <div class="rating-stars">
                        @for (star of [1,2,3,4,5]; track star) {
                          <button
                            type="button"
                            class="star-btn"
                            [class.star-btn--active]="selectedRating >= star"
                            (click)="selectedRating = star"
                          >★</button>
                        }
                      </div>
                    </div>
                    <textarea
                      [(ngModel)]="completionNotes"
                      placeholder="Notities over je ervaring (optioneel)"
                      rows="2"
                      class="notes-input"
                    ></textarea>
                    <div class="complete-actions">
                      <button class="btn btn-secondary btn-sm" (click)="cancelComplete()">Annuleer</button>
                      <button class="btn btn-primary btn-sm" (click)="submitComplete(exercise.id)" [disabled]="isCompleting">
                        @if (isCompleting) { <span class="spinner spinner-sm"></span> }
                        Voltooien
                      </button>
                    </div>
                  </div>
                }

                @if (completedId === exercise.id) {
                  <div class="alert alert-success">Oefening voltooid! Goed gedaan! 🎉</div>
                }
              </div>
            }

            <div class="exercise-actions">
              @if (selectedExercise?.id !== exercise.id) {
                <button class="btn btn-primary btn-sm" (click)="selectExercise(exercise)">Bekijken</button>
              } @else {
                @if (!showCompleteForm && completedId !== exercise.id) {
                  <button class="btn btn-secondary btn-sm" (click)="selectedExercise = null">Sluiten</button>
                  <button class="btn btn-primary btn-sm" (click)="startComplete()">Voltooien</button>
                } @else if (completedId === exercise.id) {
                  <button class="btn btn-secondary btn-sm" (click)="resetComplete()">Sluiten</button>
                }
              }
            </div>
          </div>
        } @empty {
          @if (!exercisesStore.loading()) {
            <div class="empty-state card">
              <div class="empty-icon">🧘</div>
              <p>Geen oefeningen beschikbaar.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .exercises-page {
      padding: 1.5rem;
      max-width: 1100px;
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

    .stats-bar {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
    }

    .stat-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }

    .stat-lbl {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .stat-divider {
      width: 1px;
      height: 32px;
      background: var(--border);
    }

    .category-filter {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.375rem 0.875rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: none;
      font-size: 0.8125rem;
      color: var(--text-light);
      cursor: pointer;
      transition: all var(--transition);

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.filter-btn--active { background: var(--primary); border-color: var(--primary); color: #fff; }
    }

    .exercises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .exercise-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: box-shadow var(--transition);

      &.exercise-card--active {
        box-shadow: 0 0 0 2px var(--primary);
      }
    }

    .exercise-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .exercise-meta {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .category-tag {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.1875rem 0.5rem;
      border-radius: 999px;
      background: var(--primary-light);
      color: var(--primary);
    }

    .difficulty-badge {
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.1875rem 0.5rem;
      border-radius: 999px;
    }

    .difficulty--beginner { background: #d1fae5; color: #065f46; }
    .difficulty--intermediate { background: #fef3c7; color: #92400e; }
    .difficulty--advanced { background: #fee2e2; color: #991b1b; }

    .duration-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .exercise-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .exercise-desc {
      font-size: 0.875rem;
      color: var(--text-light);
      margin: 0;
      line-height: 1.5;
    }

    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .benefit-item {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .exercise-detail {
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;

      h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 0.5rem;
      }
    }

    .steps-list {
      padding-left: 1.25rem;
      margin: 0 0 1rem;

      li {
        font-size: 0.8125rem;
        color: var(--text-light);
        line-height: 1.5;
        margin-bottom: 0.375rem;
      }
    }

    .complete-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg);
      border-radius: var(--radius);
    }

    .rating-section label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 0.375rem;
    }

    .rating-stars {
      display: flex;
      gap: 0.25rem;
    }

    .star-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--border);
      cursor: pointer;
      padding: 0;
      transition: color var(--transition);

      &.star-btn--active, &:hover { color: #F59E0B; }
    }

    .notes-input {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
    }

    .complete-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .exercise-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;

      .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
      p { color: var(--text-light); margin: 0; }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .spinner--dark {
      border-color: var(--border);
      border-top-color: var(--primary);
    }

    .spinner-sm {
      width: 12px;
      height: 12px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .alert { padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.875rem; }
    .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #10B981; }
  `],
})
export class ExercisesComponent implements OnInit {
  readonly exercisesStore = inject(ExercisesStore);
  private cdr = inject(ChangeDetectorRef);

  selectedExercise: Exercise | null = null;
  showCompleteForm = false;
  completionNotes = '';
  selectedRating = 0;
  isCompleting = false;
  completedId: string | null = null;

  ngOnInit(): void {
    this.exercisesStore.loadExercises();
    this.exercisesStore.loadStats();
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      breathing: '🫁',
      grounding: '🌱',
      mindfulness: '🧘',
      visualization: '✨',
      relaxation: '😌',
      cognitive: '🧠',
      movement: '🚶',
    };
    return icons[cat] || '💪';
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      breathing: 'Ademhaling',
      grounding: 'Grounding',
      mindfulness: 'Mindfulness',
      visualization: 'Visualisatie',
      relaxation: 'Ontspanning',
      cognitive: 'Cognitief',
      movement: 'Beweging',
    };
    return labels[cat] || cat;
  }

  getDifficultyLabel(diff: string): string {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Gemiddeld',
      advanced: 'Gevorderd',
    };
    return labels[diff] || diff;
  }

  selectExercise(exercise: Exercise): void {
    this.selectedExercise = exercise;
    this.showCompleteForm = false;
    this.completedId = null;
  }

  startComplete(): void {
    this.showCompleteForm = true;
    this.completionNotes = '';
    this.selectedRating = 0;
  }

  cancelComplete(): void {
    this.showCompleteForm = false;
  }

  async submitComplete(exerciseId: string): Promise<void> {
    this.isCompleting = true;
    const success = await this.exercisesStore.completeExercise(
      exerciseId,
      this.completionNotes || undefined,
      this.selectedRating || undefined,
    );
    this.isCompleting = false;
    if (success) {
      this.completedId = exerciseId;
      this.showCompleteForm = false;
      this.exercisesStore.loadStats();
    }
    this.cdr.markForCheck();
  }

  resetComplete(): void {
    this.selectedExercise = null;
    this.completedId = null;
    this.showCompleteForm = false;
  }
}
