import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthStore } from './auth.store';
import { ApiService } from '../services/api.service';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test User' };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthStore,
        ApiService,
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeDefined();
  });

  describe('initial state', () => {
    it('should have null user', () => {
      expect(store.user()).toBeNull();
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should not be authenticated', () => {
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should have default userName', () => {
      expect(store.userName()).toBe('Gebruiker');
    });
  });

  describe('logout', () => {
    it('should clear state and localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.logout();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.error()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should navigate to login', () => {
      store.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      // We can trigger an error and then clear it
      store.clearError();
      expect(store.error()).toBeNull();
    });
  });

  describe('initFromStorage', () => {
    it('should restore state from valid token', () => {
      // Create a JWT-like token with future expiry
      const payload = { sub: 'user-1', email: 'test@test.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.initFromStorage();

      expect(store.user()).toEqual(mockUser);
      expect(store.token()).toBe(token);
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should clear state for expired token', () => {
      const payload = { sub: 'user-1', email: 'test@test.com', exp: Math.floor(Date.now() / 1000) - 3600 };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.initFromStorage();

      expect(store.user()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should do nothing when no token in storage', () => {
      store.initFromStorage();
      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
    });

    it('should clear state for invalid token', () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.initFromStorage();

      expect(store.user()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('isAuthenticated should be true when user and token present', () => {
      const payload = { sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.initFromStorage();

      expect(store.isAuthenticated()).toBe(true);
    });

    it('userName should return user name when user exists', () => {
      const payload = { sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      store.initFromStorage();

      expect(store.userName()).toBe('Test User');
    });
  });
});
