import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Start your coaching journey today</p>
        </div>

        @if (authStore.error()) {
          <div class="alert alert-error">
            {{ authStore.error() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="John Doe"
              [class.input-error]="isFieldInvalid('name')"
            />
            @if (isFieldInvalid('name')) {
              <span class="error-message">Name is required</span>
            }
          </div>

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
                @if (registerForm.get('email')?.errors?.['required']) {
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
              placeholder="Min. 6 characters"
              [class.input-error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">
                @if (registerForm.get('password')?.errors?.['required']) {
                  Password is required
                } @else {
                  Password must be at least 6 characters
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Re-enter your password"
              [class.input-error]="isFieldInvalid('confirmPassword')"
            />
            @if (isFieldInvalid('confirmPassword')) {
              <span class="error-message">
                @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                  Please confirm your password
                } @else {
                  Passwords do not match
                }
              </span>
            }
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="authStore.loading()"
          >
            @if (authStore.loading()) {
              <span class="spinner"></span>
              Account aanmaken...
            } @else {
              Account aanmaken
            }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
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
      padding: 2rem 1rem;
      background-color: var(--bg);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background-color: var(--surface);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      padding: 2.75rem;
      animation: fadeUp 0.3s ease-out;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .auth-header {
      margin-bottom: 2rem;

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

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
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
export class RegisterComponent {
  readonly authStore = inject(AuthStore);
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.authStore.clearError();
    const { email, password, name } = this.registerForm.value;
    this.authStore.register(email, password, name);
  }
}
