import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStore, AppNotification } from '../../core/stores/notification.store';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthStore } from '../../core/stores/auth.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss'],
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  private notificationStore = inject(NotificationStore);
  private wsService = inject(WebSocketService);
  private authStore = inject(AuthStore);
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private sub?: Subscription;

  visibleNotifications: AppNotification[] = [];

  ngOnInit(): void {
    const userId = this.authStore.user()?.id;
    if (!userId) return;

    this.sub = this.wsService.on<{ type: string; message: string }>(`reminder:${userId}`)
      .subscribe((data) => {
        this.notificationStore.addNotification({
          type: 'checkin-reminder',
          message: data.message,
        });
        this.syncVisible();
      });

    this.wsService.on<{ type: string; report: any }>(`report:${userId}`)
      .subscribe(() => {
        this.notificationStore.addNotification({
          type: 'weekly-report',
          message: 'Je wekelijkse coaching rapport is klaar!',
        });
        this.syncVisible();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(t => clearTimeout(t));
  }

  dismiss(id: string): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.notificationStore.removeNotification(id);
    this.visibleNotifications = this.visibleNotifications.filter(n => n.id !== id);
  }

  private syncVisible(): void {
    const all = this.notificationStore.notifications();
    this.visibleNotifications = all.slice(0, 5);

    this.visibleNotifications.forEach(n => {
      if (!this.timers.has(n.id)) {
        const timer = setTimeout(() => this.dismiss(n.id), 5000);
        this.timers.set(n.id, timer);
      }
    });
  }
}
