import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { JournalEntry } from '@coaching-app/shared/types';
import { firstValueFrom, timeout } from 'rxjs';

export interface JournalState {
  entries: JournalEntry[];
  dailyPrompt: string;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  dailyPrompt: '',
  total: 0,
  loading: false,
  error: null,
};

export interface CreateEntryData {
  prompt?: string;
  content?: string;
  mood?: number;
  tags?: string[];
  emotion?: string;
  sliderValue?: number;
  factors?: string[];
}

export interface UpdateEntryData {
  content?: string;
  mood?: number;
  tags?: string[];
  emotion?: string;
  sliderValue?: number;
  factors?: string[];
}

export const JournalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ApiService);
    return {
      async loadEntries(page = 1, limit = 20): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(
            api.get<{ data: JournalEntry[]; total: number }>(`/journal?page=${page}&limit=${limit}`)
          );
          patchState(store, { entries: response.data, total: response.total, loading: false });
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Laden mislukt' });
        }
      },

      async loadDailyPrompt(): Promise<void> {
        try {
          const response = await firstValueFrom(api.get<{ prompt: string }>('/journal/prompt'));
          patchState(store, { dailyPrompt: response.prompt });
        } catch { /* silent fail */ }
      },

      async createEntry(data: CreateEntryData): Promise<JournalEntry | null> {
        patchState(store, { error: null });
        try {
          const entry = await firstValueFrom(api.post<JournalEntry>('/journal', data).pipe(timeout(15000)));
          patchState(store, {
            entries: [entry, ...store.entries()],
            total: store.total() + 1,
          });
          return entry;
        } catch (error: any) {
          const message = error?.name === 'TimeoutError'
            ? 'Verzoek verlopen. Probeer opnieuw.'
            : error?.error?.message || 'Opslaan mislukt';
          patchState(store, { error: message });
          return null;
        }
      },

      async updateEntry(id: string, data: UpdateEntryData): Promise<JournalEntry | null> {
        patchState(store, { error: null });
        try {
          const updated = await firstValueFrom(
            api.patch<JournalEntry>(`/journal/${id}`, data).pipe(timeout(15000))
          );
          patchState(store, {
            entries: store.entries().map(e => e.id === id ? updated : e),
          });
          return updated;
        } catch (error: any) {
          const message = error?.name === 'TimeoutError'
            ? 'Verzoek verlopen. Probeer opnieuw.'
            : error?.error?.message || 'Bijwerken mislukt';
          patchState(store, { error: message });
          return null;
        }
      },

      async deleteEntry(id: string): Promise<boolean> {
        try {
          await firstValueFrom(api.delete(`/journal/${id}`));
          patchState(store, {
            entries: store.entries().filter(e => e.id !== id),
            total: store.total() - 1,
          });
          return true;
        } catch (error: any) {
          patchState(store, { error: error?.error?.message || 'Verwijderen mislukt' });
          return false;
        }
      },
    };
  }),
);
