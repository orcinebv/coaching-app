import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { NotificationBannerComponent } from './shared/components/notification-banner.component';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationBannerComponent],
  template: `
    @if (authStore.isAuthenticated()) {
      <app-navbar />
      <app-notification-banner />
    }
    <router-outlet />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `],
})
export class AppComponent {
  readonly authStore = inject(AuthStore);

  constructor() {
    this.authStore.initFromStorage();
  }
}
