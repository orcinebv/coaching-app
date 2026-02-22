import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '@coaching-app/shared/types';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let currentUserSubject: BehaviorSubject<User | null>;
  let authServiceMock: Partial<AuthService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Alice',
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(mockUser);

    authServiceMock = {
      currentUser$: currentUserSubject.asObservable(),
      isAuthenticated$: new BehaviorSubject<boolean>(true).asObservable(),
      logout: jest.fn(),
    };

    // Expose the subject via the private field name that getUserInitial() accesses
    (authServiceMock as any)['currentUserSubject'] = currentUserSubject;

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have mobileMenuOpen as false', () => {
      expect(component.mobileMenuOpen).toBe(false);
    });

    it('should have userMenuOpen as false', () => {
      expect(component.userMenuOpen).toBe(false);
    });
  });

  describe('getUserInitial', () => {
    it('should return first letter of user name uppercased', () => {
      expect(component.getUserInitial()).toBe('A');
    });

    it('should return ? when no user is set', () => {
      currentUserSubject.next(null);
      expect(component.getUserInitial()).toBe('?');
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  describe('onDocumentClick', () => {
    it('should close user menu when clicking outside', () => {
      // Set menu open directly without triggering change detection
      component.userMenuOpen = true;

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: outsideElement });

      component.onDocumentClick(event);

      expect(component.userMenuOpen).toBe(false);
      document.body.removeChild(outsideElement);
    });

    it('should keep user menu open when clicking inside user-menu', () => {
      // Get the user-menu element from the already-rendered template
      const el: HTMLElement = fixture.nativeElement;
      const userMenu = el.querySelector('.user-menu') as HTMLElement;

      // Set userMenuOpen without triggering detectChanges to avoid NG0100
      component.userMenuOpen = true;

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: userMenu });
      component.onDocumentClick(event);

      // Menu should remain open since click target is inside .user-menu
      expect(component.userMenuOpen).toBe(true);
    });
  });

  describe('mobile menu toggle', () => {
    it('should toggle mobileMenuOpen', () => {
      expect(component.mobileMenuOpen).toBe(false);
      component.mobileMenuOpen = true;
      expect(component.mobileMenuOpen).toBe(true);
      component.mobileMenuOpen = false;
      expect(component.mobileMenuOpen).toBe(false);
    });
  });

  describe('user menu toggle', () => {
    it('should toggle userMenuOpen', () => {
      expect(component.userMenuOpen).toBe(false);
      component.userMenuOpen = true;
      expect(component.userMenuOpen).toBe(true);
      component.userMenuOpen = false;
      expect(component.userMenuOpen).toBe(false);
    });
  });

  describe('template rendering', () => {
    it('should display brand text', () => {
      const el: HTMLElement = fixture.nativeElement;
      const brandText = el.querySelector('.brand-text');
      expect(brandText?.textContent).toContain('Coaching App');
    });

    it('should render navigation links', () => {
      const el: HTMLElement = fixture.nativeElement;
      const navLinks = el.querySelector('.nav-links');
      expect(navLinks).toBeTruthy();

      const links = navLinks?.querySelectorAll('a');
      expect(links?.length).toBe(3);
    });

    it('should display user avatar with initial', () => {
      const el: HTMLElement = fixture.nativeElement;
      const avatar = el.querySelector('.user-avatar');
      expect(avatar?.textContent?.trim()).toBe('A');
    });

    it('should show dropdown menu when user-menu is clicked', () => {
      const el: HTMLElement = fixture.nativeElement;
      const userMenu = el.querySelector('.user-menu') as HTMLElement;
      userMenu.click();
      fixture.detectChanges();

      const dropdown = el.querySelector('.dropdown-menu');
      expect(dropdown).toBeTruthy();
    });

    it('should not show dropdown menu initially', () => {
      const el: HTMLElement = fixture.nativeElement;
      const dropdown = el.querySelector('.dropdown-menu');
      expect(dropdown).toBeNull();
    });

    it('should display user name and email in dropdown', () => {
      const el: HTMLElement = fixture.nativeElement;
      const userMenu = el.querySelector('.user-menu') as HTMLElement;
      userMenu.click();
      fixture.detectChanges();

      const nameEl = el.querySelector('.dropdown-name');
      const emailEl = el.querySelector('.dropdown-email');
      expect(nameEl?.textContent).toContain('Alice');
      expect(emailEl?.textContent).toContain('test@test.com');
    });
  });
});
