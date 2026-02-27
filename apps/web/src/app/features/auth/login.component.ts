import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <!-- Left panel: brand / visual -->
      <div class="auth-panel">
        <div class="panel-content">
          <div class="panel-brand">
            <div class="panel-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="panel-brand-name">Coaching App</span>
          </div>

          <div class="panel-headline">
            <h2>Groei begint<br>met bewustzijn.</h2>
            <p>Jouw persoonlijke coach, altijd beschikbaar.</p>
          </div>

          <div class="panel-features">
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Dagelijkse check-ins & stemming</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>AI-gestuurde inzichten</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Persoonlijke doelen & voortgang</span>
            </div>
          </div>
        </div>

        <div class="panel-orb panel-orb--1"></div>
        <div class="panel-orb panel-orb--2"></div>
      </div>

      <!-- Right panel: form -->
      <div class="auth-form-side">
        <div class="auth-form-container">
          <div class="auth-header">
            <h1>Welkom terug</h1>
            <p>Log in op je coaching account</p>
          </div>

          @if (authStore.error()) {
            <div class="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ authStore.error() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">E-mailadres</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="jij@voorbeeld.nl"
                [class.input-error]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <span class="error-message">
                  @if (loginForm.get('email')?.errors?.['required']) {
                    E-mail is verplicht
                  } @else {
                    Voer een geldig e-mailadres in
                  }
                </span>
              }
            </div>

            <div class="form-group">
              <label for="password">Wachtwoord</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Jouw wachtwoord"
                [class.input-error]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <span class="error-message">Wachtwoord is verplicht</span>
              }
            </div>

            <button
              type="submit"
              class="btn-submit"
              [disabled]="authStore.loading()"
            >
              @if (authStore.loading()) {
                <span class="spinner"></span>
                Inloggen...
              } @else {
                Inloggen
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              }
            </button>
          </form>

          <p class="auth-footer">
            Nog geen account?
            <a routerLink="/register">Aanmelden</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    /* ── Left panel ─────────────────────────────────────── */
    .auth-panel {
      position: relative;
      background: linear-gradient(145deg, #1a0a4a 0%, #2d1b69 40%, #4a2491 70%, #6d28d9 100%);
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;

      @media (max-width: 768px) { display: none; }
    }

    .panel-content {
      position: relative;
      z-index: 1;
    }

    .panel-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 4rem;
    }

    .panel-icon {
      width: 42px;
      height: 42px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .panel-brand-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: -0.01em;
    }

    .panel-headline {
      margin-bottom: 3rem;

      h2 {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 3.25rem;
        font-weight: 600;
        color: #ffffff;
        line-height: 1.1;
        letter-spacing: -0.02em;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.0625rem;
        color: rgba(255, 255, 255, 0.65);
        font-weight: 400;
      }
    }

    .panel-features {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .feature-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
    }

    .panel-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
    }

    .panel-orb--1 {
      width: 320px;
      height: 320px;
      background: rgba(109, 40, 217, 0.5);
      top: -80px;
      right: -80px;
    }

    .panel-orb--2 {
      width: 280px;
      height: 280px;
      background: rgba(45, 27, 105, 0.6);
      bottom: -60px;
      left: -60px;
    }

    /* ── Right panel / form ──────────────────────────────── */
    .auth-form-side {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-color: var(--bg);
    }

    .auth-form-container {
      width: 100%;
      max-width: 400px;
      animation: fadeUp 0.35s ease-out;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .auth-header {
      margin-bottom: 2.5rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text);
        letter-spacing: -0.03em;
        line-height: 1.15;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-light);
        font-size: 0.9375rem;
      }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .alert-error {
      background-color: var(--danger-light);
      color: var(--danger);
      border: 1px solid rgba(220, 38, 38, 0.2);
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.375rem;
        letter-spacing: 0.005em;
      }

      input { width: 100%; }

      .error-message {
        display: block;
        font-size: 0.75rem;
        color: var(--danger);
        margin-top: 0.3125rem;
      }
    }

    .input-error {
      border-color: var(--danger) !important;
      &:focus { box-shadow: 0 0 0 3px var(--danger-light) !important; }
    }

    .btn-submit {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.8125rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, #4c1d95 100%);
      color: #fff;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.01em;
      box-shadow: 0 4px 14px rgba(45, 27, 105, 0.35);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(45, 27, 105, 0.45);
      }

      &:active:not(:disabled) { transform: translateY(0); }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.875rem;
      color: var(--text-light);

      a {
        color: var(--primary);
        font-weight: 600;
        margin-left: 0.25rem;

        &:hover { text-decoration: underline; }
      }
    }
  `],
})
export class LoginComponent {
  readonly authStore = inject(AuthStore);
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.authStore.clearError();
    const { email, password } = this.loginForm.value;
    this.authStore.login(email, password);
  }
}
