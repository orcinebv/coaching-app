import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
          <a routerLink="/dashboard" class="brand-link">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span class="brand-text">Coaching App</span>
          </a>
        </div>

        <div class="nav-links" [class.nav-open]="mobileMenuOpen">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/chat" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat
          </a>
          <a routerLink="/checkin" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Check-in
          </a>
          <a routerLink="/goals" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 8 12 12 14 14"/>
            </svg>
            Doelen
          </a>
          <a routerLink="/journal" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Dagboek
          </a>
          <a routerLink="/exercises" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            Oefeningen
          </a>
          <a routerLink="/analytics" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics
          </a>
          <a routerLink="/sentiment" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Sentiment
          </a>
          <a routerLink="/insights" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26A7 7 0 0 1 12 2z"/>
              <line x1="10" y1="21" x2="14" y2="21"/>
            </svg>
            Inzichten
          </a>
          <a routerLink="/settings" routerLinkActive="active" (click)="mobileMenuOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Instellingen
          </a>
        </div>

        <div class="navbar-right">
          <div class="user-menu" (click)="userMenuOpen = !userMenuOpen">
            <div class="user-avatar">
              {{ getUserInitial() }}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" [class.open]="userMenuOpen">
              <polyline points="6 9 12 15 18 9"/>
            </svg>

            @if (userMenuOpen) {
              <div class="dropdown-menu">
                <div class="dropdown-user">
                  <span class="dropdown-name">{{ authStore.user()?.name }}</span>
                  <span class="dropdown-email">{{ authStore.user()?.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" (click)="logout()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            }
          </div>

          <button class="hamburger" (click)="mobileMenuOpen = !mobileMenuOpen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              @if (mobileMenuOpen) {
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              } @else {
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              }
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: var(--surface);
      border-bottom: 1px solid var(--border);
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .navbar-content {
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
    }

    .navbar-brand {
      .brand-link {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        text-decoration: none;
      }

      .brand-text {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text);
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        border-radius: var(--radius);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-light);
        text-decoration: none;
        transition: all var(--transition);

        &:hover {
          background-color: var(--surface-hover);
          color: var(--text);
        }

        &.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
      }

      @media (max-width: 768px) {
        display: none;
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        background-color: var(--surface);
        border-bottom: 1px solid var(--border);
        flex-direction: column;
        padding: 0.5rem;
        box-shadow: var(--shadow-md);

        &.nav-open {
          display: flex;
        }

        a {
          width: 100%;
          padding: 0.75rem 1rem;
        }
      }
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius);

      &:hover {
        background-color: var(--surface-hover);
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .chevron {
      transition: transform var(--transition);
      color: var(--text-light);

      &.open {
        transform: rotate(180deg);
      }
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      width: 220px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 40;
    }

    .dropdown-user {
      padding: 0.875rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .dropdown-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }

    .dropdown-email {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--border);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      font-size: 0.875rem;
      color: var(--text);
      cursor: pointer;
      transition: background-color var(--transition);

      &:hover {
        background-color: var(--surface-hover);
      }
    }

    .hamburger {
      display: none;
      background: none;
      border: none;
      padding: 0.375rem;
      color: var(--text);
      cursor: pointer;
      border-radius: var(--radius-sm);

      &:hover {
        background-color: var(--surface-hover);
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }
  `],
})
export class NavbarComponent {
  readonly authStore = inject(AuthStore);
  mobileMenuOpen = false;
  userMenuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.userMenuOpen = false;
    }
  }

  getUserInitial(): string {
    const name = this.authStore.user()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  logout(): void {
    this.authStore.logout();
  }
}
