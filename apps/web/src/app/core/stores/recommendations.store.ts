import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { Recommendation } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface RecommendationsState {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recommendations: [],
  loading: false,
  error: null,
};

export const RecommendationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadRecommendations(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const recommendations = await firstValueFrom(api.get<Recommendation[]>('/recommendations'));
          patchState(store, { recommendations, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async giveFeedback(id: string, helpful: boolean): Promise<void> {
        try {
          await firstValueFrom(api.post(`/recommendations/${id}/feedback`, { helpful }));
          patchState(store, {
            recommendations: store.recommendations().map(r => r.id === id ? { ...r, helpful } : r),
          });
        } catch { /* silent */ }
      },

      async dismiss(id: string): Promise<void> {
        try {
          await firstValueFrom(api.delete(`/recommendations/${id}`));
          patchState(store, {
            recommendations: store.recommendations().filter(r => r.id !== id),
          });
        } catch { /* silent */ }
      },
    };
  }),
);
