import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthResponse, User } from '@coaching-app/shared/types';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceMock: jest.Mocked<Pick<ApiService, 'get' | 'post' | 'patch' | 'delete'>>;
  let routerMock: jest.Mocked<Pick<Router, 'navigate'>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
  };

  // Create a valid JWT-like token with a future expiration
  function createMockToken(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'user-1', exp }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
  }

  const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const validToken = createMockToken(futureExp);
  const expiredToken = createMockToken(pastExp);

  const mockAuthResponse: AuthResponse = {
    access_token: validToken,
    user: mockUser,
  };

  beforeEach(() => {
    localStorage.clear();

    apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call API with email and password', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockAuthResponse));

      service.login('test@test.com', 'password123').subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@test.com',
          password: 'password123',
        });
        done();
      });
    });

    it('should store token and user in localStorage', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockAuthResponse));

      service.login('test@test.com', 'password123').subscribe(() => {
        expect(localStorage.getItem('token')).toBe(validToken);
        expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
        done();
      });
    });

    it('should update currentUser$ and isAuthenticated$', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockAuthResponse));

      service.login('test@test.com', 'password123').subscribe(() => {
        service.currentUser$.subscribe((user) => {
          expect(user).toEqual(mockUser);
        });

        service.isAuthenticated$.subscribe((isAuth) => {
          expect(isAuth).toBe(true);
          done();
        });
      });
    });

    it('should propagate API errors', (done) => {
      apiServiceMock.post.mockReturnValue(throwError(() => new Error('Unauthorized')));

      service.login('test@test.com', 'wrong').subscribe({
        error: (err) => {
          expect(err.message).toBe('Unauthorized');
          done();
        },
      });
    });
  });

  describe('register', () => {
    it('should call API with email, password, and name', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockAuthResponse));

      service.register('test@test.com', 'password123', 'Test User').subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/register', {
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
        });
        done();
      });
    });

    it('should store auth data on successful registration', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockAuthResponse));

      service.register('test@test.com', 'password123', 'Test User').subscribe(() => {
        expect(localStorage.getItem('token')).toBe(validToken);
        expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
        done();
      });
    });
  });

  describe('logout', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should set currentUser$ to null', (done) => {
      service.logout();

      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should set isAuthenticated$ to false', (done) => {
      service.logout();

      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
        done();
      });
    });

    it('should navigate to /login', () => {
      service.logout();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true for valid non-expired token', () => {
      localStorage.setItem('token', validToken);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false for expired token', () => {
      localStorage.setItem('token', expiredToken);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false for malformed token', () => {
      localStorage.setItem('token', 'not-a-valid-jwt');
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false for token with invalid base64 payload', () => {
      localStorage.setItem('token', 'header.!!!invalid!!!.signature');
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('initializeFromStorage', () => {
    it('should restore user from localStorage on construction with valid token', () => {
      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Re-create service to trigger constructor
      const newService = new AuthService(
        apiServiceMock as unknown as ApiService,
        routerMock as unknown as Router,
      );

      let currentUser: User | null = null;
      let isAuth = false;

      newService.currentUser$.subscribe((u) => (currentUser = u));
      newService.isAuthenticated$.subscribe((a) => (isAuth = a));

      expect(currentUser).toEqual(mockUser);
      expect(isAuth).toBe(true);
    });

    it('should not restore user with expired token', () => {
      localStorage.setItem('token', expiredToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const newService = new AuthService(
        apiServiceMock as unknown as ApiService,
        routerMock as unknown as Router,
      );

      let currentUser: User | null = null;
      newService.currentUser$.subscribe((u) => (currentUser = u));

      expect(currentUser).toBeNull();
    });

    it('should logout if user JSON is invalid', () => {
      localStorage.setItem('token', validToken);
      localStorage.setItem('user', '{invalid-json');

      new AuthService(
        apiServiceMock as unknown as ApiService,
        routerMock as unknown as Router,
      );

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
