import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthStore } from '../../core/stores/auth.store';
import { ApiService } from '../../core/services/api.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        AuthStore,
        ApiService,
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a login form', () => {
    expect(component.loginForm).toBeDefined();
  });

  it('should have email and password controls', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should have form invalid initially', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should validate email format', () => {
    component.loginForm.patchValue({ email: 'invalid', password: 'test123' });
    expect(component.loginForm.get('email')?.valid).toBe(false);

    component.loginForm.patchValue({ email: 'valid@example.com' });
    expect(component.loginForm.get('email')?.valid).toBe(true);
  });

  it('should require password', () => {
    component.loginForm.patchValue({ email: 'test@example.com', password: '' });
    expect(component.loginForm.get('password')?.valid).toBe(false);
  });

  describe('isFieldInvalid', () => {
    it('should return false for untouched fields', () => {
      expect(component.isFieldInvalid('email')).toBe(false);
    });

    it('should return true for touched invalid fields', () => {
      component.loginForm.get('email')?.markAsTouched();
      expect(component.isFieldInvalid('email')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should mark all fields as touched when form is invalid', () => {
      component.onSubmit();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should not submit when form is invalid', () => {
      const loginSpy = jest.spyOn(component.authStore, 'login');
      component.onSubmit();
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should render login form', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('form')).toBeTruthy();
      expect(el.querySelector('input[type="email"]')).toBeTruthy();
      expect(el.querySelector('input[type="password"]')).toBeTruthy();
    });

    it('should render submit button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const button = el.querySelector('button[type="submit"]');
      expect(button?.textContent).toContain('Sign In');
    });

    it('should render register link', () => {
      const el: HTMLElement = fixture.nativeElement;
      const link = el.querySelector('a[routerLink="/register"]') || el.querySelector('a[href="/register"]');
      expect(link).toBeTruthy();
    });
  });
});
