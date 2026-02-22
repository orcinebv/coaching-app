import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { User, AuthResponse } from '@coaching-app/shared/types';
import { firstValueFrom } from 'rxjs';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!user() && !!token()),
    userName: computed(() => user()?.name || 'Gebruiker'),
  })),
  withMethods((store) => {
    const api = inject(ApiService);
    const router = inject(Router);

    return {
      async login(email: string, password: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(api.post<AuthResponse>('/auth/login', { email, password }));
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          patchState(store, { user: response.user, token: response.access_token, loading: false });
          router.navigate(['/dashboard']);
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Login mislukt' });
        }
      },

      async register(email: string, password: string, name: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(api.post<AuthResponse>('/auth/register', { email, password, name }));
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          patchState(store, { user: response.user, token: response.access_token, loading: false });
          router.navigate(['/dashboard']);
        } catch (error: any) {
          patchState(store, { loading: false, error: error?.error?.message || 'Registratie mislukt' });
        }
      },

      logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        patchState(store, { user: null, token: null, error: null });
        router.navigate(['/login']);
      },

      initFromStorage(): void {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (token && userJson) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
              patchState(store, { user: JSON.parse(userJson), token });
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
