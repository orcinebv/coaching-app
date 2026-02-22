import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface AppNotification {
  id: string;
  type: 'checkin-reminder' | 'weekly-report' | 'info';
  message: string;
  createdAt: Date;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): void {
      const newNotification: AppNotification = {
        ...notification,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      patchState(store, {
        notifications: [newNotification, ...store.notifications()],
        unreadCount: store.unreadCount() + 1,
      });
    },

    removeNotification(id: string): void {
      patchState(store, {
        notifications: store.notifications().filter(n => n.id !== id),
      });
    },

    clearAll(): void {
      patchState(store, { notifications: [], unreadCount: 0 });
    },

    markAllRead(): void {
      patchState(store, { unreadCount: 0 });
    },
  })),
);
