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
  template: `
    <div class="notification-container">
      @for (notification of visibleNotifications; track notification.id) {
        <div class="notification" [class]="'notification--' + notification.type">
          <div class="notification-icon">
            @if (notification.type === 'checkin-reminder') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            } @else if (notification.type === 'weekly-report') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            }
          </div>
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" (click)="dismiss(notification.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 72px;
      right: 1rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 380px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s ease-out;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .notification--checkin-reminder {
      background-color: #ede9fe;
      color: #5b21b6;
      border-left: 3px solid #6366f1;
    }

    .notification--weekly-report {
      background-color: #d1fae5;
      color: #065f46;
      border-left: 3px solid #10b981;
    }

    .notification--info {
      background-color: #e0f2fe;
      color: #0c4a6e;
      border-left: 3px solid #0ea5e9;
    }

    .notification-icon {
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      line-height: 1.4;
    }

    .notification-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      opacity: 0.6;
      color: inherit;
      border-radius: var(--radius-sm);

      &:hover {
        opacity: 1;
        background-color: rgba(0,0,0,0.08);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
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
