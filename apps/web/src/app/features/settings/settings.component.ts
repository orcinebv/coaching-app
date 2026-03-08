import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Users, Zap, Search } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

interface UserSettings {
  notifications: boolean;
  theme: string;
  language: string;
  checkInTime: string;
}

interface CoachingSettings {
  coachingStyle: string;
  focusAreas: string;
  weeklyGoal: number;
  reminderEnabled: boolean;
  reminderFrequency: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  protected Math = Math;
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'notifications' | 'coaching' | 'privacy'>('notifications');
  loading = signal(true);
  saving = signal(false);
  saveSuccess = signal(false);
  exporting = signal(false);
  deleting = signal(false);
  showDeleteConfirm = signal(false);
  auditLog = signal<{ action: string; resource: string; createdAt: string }[]>([]);

  userSettings: UserSettings = {
    notifications: true,
    theme: 'light',
    language: 'nl',
    checkInTime: '09:00',
  };

  coachingSettings: CoachingSettings = {
    coachingStyle: 'supportive',
    focusAreas: '[]',
    weeklyGoal: 3,
    reminderEnabled: true,
    reminderFrequency: 'daily',
  };

  coachingStyles = [
    { value: 'supportive', label: 'Ondersteunend', icon: Users, desc: 'Warm en bemoedigend' },
    { value: 'challenging', label: 'Uitdagend', icon: Zap, desc: 'Ambitieus en direct' },
    { value: 'analytical', label: 'Analytisch', icon: Search, desc: 'Data-gedreven en logisch' },
  ];

  focusAreaOptions = [
    { value: 'stress', label: 'Stress' },
    { value: 'productivity', label: 'Productiviteit' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'work-life-balance', label: 'Work-life balance' },
    { value: 'relationships', label: 'Relaties' },
    { value: 'health', label: 'Gezondheid' },
    { value: 'career', label: 'Carrière' },
    { value: 'finances', label: 'Financiën' },
  ];

  async ngOnInit(): Promise<void> {
    try {
      const [settings, coaching] = await Promise.all([
        firstValueFrom(this.api.get<UserSettings>('/users/me/settings')),
        firstValueFrom(this.api.get<CoachingSettings>('/users/me/coaching-settings')),
      ]);
      this.userSettings = settings;
      this.coachingSettings = coaching;
    } catch {
      // use defaults
    } finally {
      this.loading.set(false);
    }
  }

  isFocusSelected(value: string): boolean {
    try {
      const areas: string[] = JSON.parse(this.coachingSettings.focusAreas || '[]');
      return areas.includes(value);
    } catch {
      return false;
    }
  }

  toggleFocus(value: string): void {
    try {
      const areas: string[] = JSON.parse(this.coachingSettings.focusAreas || '[]');
      const idx = areas.indexOf(value);
      if (idx > -1) {
        areas.splice(idx, 1);
      } else {
        areas.push(value);
      }
      this.coachingSettings.focusAreas = JSON.stringify(areas);
    } catch {
      this.coachingSettings.focusAreas = JSON.stringify([value]);
    }
  }

  async saveUserSettings(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.patch('/users/me/settings', this.userSettings));
      this.showSuccess();
    } finally {
      this.saving.set(false);
    }
  }

  async saveCoachingSettings(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.patch('/users/me/coaching-settings', this.coachingSettings));
      this.showSuccess();
    } finally {
      this.saving.set(false);
    }
  }

  async loadAuditLog(): Promise<void> {
    try {
      const logs = await firstValueFrom(
        this.api.get<{ action: string; resource: string; createdAt: string }[]>('/users/me/audit-log?limit=10'),
      );
      this.auditLog.set(logs);
    } catch {
      // ignore
    }
  }

  async exportData(): Promise<void> {
    this.exporting.set(true);
    try {
      const token = localStorage.getItem('token');
      const { environment: env } = await import('../../../environments/environment');
      const response = await fetch(`${env.apiUrl}/users/me/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mijn-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export mislukt. Probeer het opnieuw.');
    } finally {
      this.exporting.set(false);
    }
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirm.set(true);
  }

  async deleteAccount(): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.delete('/users/me/account'));
      this.auth.logout();
    } catch {
      alert('Verwijderen mislukt. Probeer het opnieuw.');
    } finally {
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }
  }

  private showSuccess(): void {
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }
}
