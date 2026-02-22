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
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your coaching account</p>
        </div>

        @if (authStore.error()) {
          <div class="alert alert-error">
            {{ authStore.error() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              [class.input-error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-message">
                @if (loginForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else {
                  Please enter a valid email
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.input-error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">Password is required</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            [disabled]="authStore.loading()"
          >
            @if (authStore.loading()) {
              <span class="spinner"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
      background-color: var(--bg);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 2.5rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-light);
        font-size: 0.875rem;
      }
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .alert-error {
      background-color: var(--danger-light);
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.375rem;
      }

      input {
        width: 100%;
      }

      .error-message {
        display: block;
        font-size: 0.75rem;
        color: var(--danger);
        margin-top: 0.25rem;
      }
    }

    .input-error {
      border-color: var(--danger) !important;

      &:focus {
        box-shadow: 0 0 0 3px var(--danger-light) !important;
      }
    }

    button[type="submit"] {
      margin-top: 0.5rem;
      padding: 0.75rem;
      font-size: 1rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-light);

      a {
        color: var(--primary);
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
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
