import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { ApiService } from '../services/api.service';
import { UserInsight } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface InsightsState {
  insights: UserInsight[];
  loading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  insights: [],
  loading: false,
  error: null,
};

export const InsightsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ insights }) => ({
    unreadCount: computed(() => insights().filter(i => !i.isRead).length),
    milestones: computed(() => insights().filter(i => i.type === 'milestone')),
    patterns: computed(() => insights().filter(i => i.type === 'pattern')),
  })),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadInsights(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const insights = await firstValueFrom(api.get<UserInsight[]>('/insights'));
          patchState(store, { insights, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async generateInsights(): Promise<void> {
        patchState(store, { loading: true });
        try {
          const insights = await firstValueFrom(api.post<UserInsight[]>('/insights/generate', {}));
          patchState(store, { insights, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Genereren mislukt' });
        }
      },

      async markRead(id: string): Promise<void> {
        try {
          await firstValueFrom(api.post(`/insights/${id}/read`, {}));
          patchState(store, {
            insights: store.insights().map(i => i.id === id ? { ...i, isRead: true } : i),
          });
        } catch { /* silent */ }
      },
    };
  }),
);
