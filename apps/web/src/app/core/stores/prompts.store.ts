import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { DailyPrompt } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface PromptsState {
  dailyPrompt: DailyPrompt | null;
  history: DailyPrompt[];
  loading: boolean;
  error: string | null;
}

const initialState: PromptsState = {
  dailyPrompt: null,
  history: [],
  loading: false,
  error: null,
};

export const PromptsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadDailyPrompt(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const dailyPrompt = await firstValueFrom(api.get<DailyPrompt>('/coaching-prompts/daily'));
          patchState(store, { dailyPrompt, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async loadHistory(): Promise<void> {
        try {
          const history = await firstValueFrom(api.get<DailyPrompt[]>('/coaching-prompts/history'));
          patchState(store, { history });
        } catch { /* silent */ }
      },

      async ratePrompt(id: string, rating: number): Promise<void> {
        try {
          await firstValueFrom(api.post(`/coaching-prompts/${id}/rate`, { rating }));
          patchState(store, {
            dailyPrompt: store.dailyPrompt()?.id === id ? { ...store.dailyPrompt()!, rating } : store.dailyPrompt(),
          });
        } catch { /* silent */ }
      },

      async skipPrompt(id: string): Promise<void> {
        try {
          await firstValueFrom(api.post(`/coaching-prompts/${id}/skip`, {}));
          patchState(store, {
            dailyPrompt: store.dailyPrompt()?.id === id ? { ...store.dailyPrompt()!, skipped: true } : store.dailyPrompt(),
          });
        } catch { /* silent */ }
      },
    };
  }),
);
