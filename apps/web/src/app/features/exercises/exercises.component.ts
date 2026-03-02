import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ExercisesStore } from '../../core/stores/exercises.store';
import { Exercise } from '@coaching-app/shared/types';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
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
