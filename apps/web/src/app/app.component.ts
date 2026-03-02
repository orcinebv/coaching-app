import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { NotificationBannerComponent } from './shared/components/notification-banner.component';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly authStore = inject(AuthStore);

  constructor() {
    this.authStore.initFromStorage();
  }
}
