import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
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
