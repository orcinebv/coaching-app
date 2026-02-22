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
            class="btn btn-primary w-full"
            [disabled]="authStore.loading()"
          >
            @if (authStore.loading()) {
              <span class="spinner"></span>
              Creating account...
            } @else {
              Create Account
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
