import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { CheckIn, CheckInStats } from '@coaching-app/shared/types';
import { firstValueFrom, timeout } from 'rxjs';

export interface CheckInState {
  checkIns: CheckIn[];
  stats: CheckInStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckInState = {
  checkIns: [],
  stats: null,
  loading: false,
  error: null,
};

export const CheckInStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ checkIns, stats }) => ({
    recentCheckIns: computed(() => checkIns().slice(0, 5)),
    chartData: computed(() => {
      const recent = checkIns().slice(0, 14).reverse();
      return {
        labels: recent.map(c => new Date(c.createdAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        mood: recent.map(c => c.mood),
        energy: recent.map(c => c.energy),
      };
    }),
    averageMood: computed(() => stats()?.averageMood ?? 0),
    totalCheckIns: computed(() => stats()?.totalCheckIns ?? 0),
    currentStreak: computed(() => stats()?.currentStreak ?? 0),
  })),
  withMethods((store) => {
    const api = inject(ApiService);

    return {
      async loadCheckIns(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(api.get<{ data: CheckIn[] }>('/checkins'));
          patchState(store, { checkIns: response.data, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Failed to load check-ins' });
        }
      },

      async createCheckIn(data: { mood: number; energy: number; notes?: string; goals?: string }): Promise<CheckIn | null> {
        patchState(store, { error: null });
        try {
          const checkIn = await firstValueFrom(
            api.post<CheckIn>('/checkins', data).pipe(timeout(15000))
          );
          patchState(store, { checkIns: [checkIn, ...store.checkIns()] });
          return checkIn;
        } catch (error: any) {
          const message = error?.name === 'TimeoutError'
            ? 'Request timed out. Please try again.'
            : error?.error?.message || 'Failed to save check-in';
          patchState(store, { error: message });
          return null;
        }
      },

      async loadStats(): Promise<void> {
        try {
          const stats = await firstValueFrom(api.get<CheckInStats>('/checkins/stats'));
          patchState(store, { stats });
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Failed to load stats' });
        }
      },
    };
  }),
);
