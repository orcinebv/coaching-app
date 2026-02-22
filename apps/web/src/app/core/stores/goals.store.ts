import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { Goal, GoalStats } from '@coaching-app/shared/types';
import { firstValueFrom, timeout } from 'rxjs';

export interface GoalsState {
  goals: Goal[];
  stats: GoalStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  stats: null,
  loading: false,
  error: null,
};

export const GoalsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ goals }) => ({
    activeGoals: computed(() => goals().filter(g => g.status === 'active')),
    completedGoals: computed(() => goals().filter(g => g.status === 'completed')),
    avgProgress: computed(() => {
      const active = goals().filter(g => g.status === 'active');
      return active.length > 0
        ? Math.round(active.reduce((sum, g) => sum + g.progress, 0) / active.length)
        : 0;
    }),
  })),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadGoals(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const goals = await firstValueFrom(api.get<Goal[]>('/goals'));
          patchState(store, { goals, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async createGoal(data: Omit<Goal, 'id' | 'status' | 'progress'>): Promise<Goal | null> {
        patchState(store, { error: null });
        try {
          const goal = await firstValueFrom(api.post<Goal>('/goals', data).pipe(timeout(15000)));
          patchState(store, { goals: [goal, ...store.goals()] });
          return goal;
        } catch (error: any) {
          const message = error?.name === 'TimeoutError'
            ? 'Verzoek verlopen. Probeer opnieuw.'
            : error?.error?.message || 'Opslaan mislukt';
          patchState(store, { error: message });
          return null;
        }
      },

      async updateGoal(id: string, data: Partial<Goal>): Promise<Goal | null> {
        patchState(store, { error: null });
        try {
          const goal = await firstValueFrom(api.patch<Goal>(`/goals/${id}`, data).pipe(timeout(15000)));
          patchState(store, { goals: store.goals().map(g => g.id === id ? goal : g) });
          return goal;
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Bijwerken mislukt' });
          return null;
        }
      },

      async deleteGoal(id: string): Promise<boolean> {
        try {
          await firstValueFrom(api.delete(`/goals/${id}`));
          patchState(store, { goals: store.goals().filter(g => g.id !== id) });
          return true;
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Verwijderen mislukt' });
          return false;
        }
      },

      async loadStats(): Promise<void> {
        try {
          const stats = await firstValueFrom(api.get<GoalStats>('/goals/stats'));
          patchState(store, { stats });
        } catch { /* silent fail */ }
      },
    };
  }),
);
