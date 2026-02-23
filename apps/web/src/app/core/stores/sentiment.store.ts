import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { SentimentResult, SentimentSummary } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface SentimentState {
  history: SentimentResult[];
  summary: SentimentSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: SentimentState = {
  history: [],
  summary: null,
  loading: false,
  error: null,
};

export const SentimentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadHistory(days = 30): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const history = await firstValueFrom(api.get<SentimentResult[]>(`/sentiment/history?days=${days}`));
          patchState(store, { history, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async loadSummary(): Promise<void> {
        try {
          const summary = await firstValueFrom(api.get<SentimentSummary>('/sentiment/summary'));
          patchState(store, { summary });
        } catch { /* silent */ }
      },

      async analyzeText(text: string, sourceType: 'journal' | 'message', sourceId: string): Promise<SentimentResult | null> {
        try {
          return await firstValueFrom(api.post<SentimentResult>('/sentiment/analyze', { text, sourceType, sourceId }));
        } catch {
          return null;
        }
      },
    };
  }),
);
