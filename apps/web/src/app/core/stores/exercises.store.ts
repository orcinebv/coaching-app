import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { Exercise, ExerciseCompletion, ExerciseStats } from '@coaching-app/shared/types';
import { firstValueFrom, timeout } from 'rxjs';

export interface ExercisesState {
  exercises: Exercise[];
  completions: ExerciseCompletion[];
  stats: ExerciseStats | null;
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExercisesState = {
  exercises: [],
  completions: [],
  stats: null,
  selectedCategory: null,
  loading: false,
  error: null,
};

export const ExercisesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ exercises, selectedCategory }) => ({
    filteredExercises: computed(() => {
      const cat = selectedCategory();
      return cat ? exercises().filter(e => e.category === cat) : exercises();
    }),
    categories: computed(() => [...new Set(exercises().map(e => e.category))]),
  })),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadExercises(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const exercises = await firstValueFrom(api.get<Exercise[]>('/exercises'));
          patchState(store, { exercises, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      setCategory(category: string | null): void {
        patchState(store, { selectedCategory: category });
      },

      async completeExercise(id: string, notes?: string, rating?: number): Promise<boolean> {
        patchState(store, { error: null });
        try {
          const completion = await firstValueFrom(
            api.post<ExerciseCompletion>(`/exercises/${id}/complete`, { notes, rating }).pipe(timeout(15000))
          );
          patchState(store, { completions: [completion, ...store.completions()] });
          return true;
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Voltooien mislukt' });
          return false;
        }
      },

      async loadStats(): Promise<void> {
        try {
          const stats = await firstValueFrom(api.get<ExerciseStats>('/exercises/stats'));
          patchState(store, { stats });
        } catch { /* silent fail */ }
      },
    };
  }),
);
