import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="settings-header">
        <h1>Instellingen</h1>
        <p class="settings-subtitle">Beheer je notificaties en coaching voorkeuren</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'notifications'" (click)="activeTab.set('notifications')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notificaties
        </button>
        <button class="tab" [class.active]="activeTab() === 'coaching'" (click)="activeTab.set('coaching')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Coaching
        </button>
        <button class="tab" [class.active]="activeTab() === 'privacy'" (click)="activeTab.set('privacy'); loadAuditLog()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Privacy
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Instellingen laden...</span>
        </div>
      }

      @if (!loading() && activeTab() === 'notifications') {
        <div class="settings-card">
          <h2>Notificatie instellingen</h2>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Notificaties</span>
              <span class="setting-desc">Ontvang dagelijkse herinneringen en rapporten</span>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="userSettings.notifications">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Check-in tijd</span>
              <span class="setting-desc">Op welk tijdstip wil je de dagelijkse reminder ontvangen?</span>
            </div>
            <input type="time" class="time-input" [(ngModel)]="userSettings.checkInTime">
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Taal</span>
              <span class="setting-desc">Taal van de interface en notificaties</span>
            </div>
            <select class="select-input" [(ngModel)]="userSettings.language">
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Thema</span>
              <span class="setting-desc">Weergave voorkeur</span>
            </div>
            <select class="select-input" [(ngModel)]="userSettings.theme">
              <option value="light">Licht</option>
              <option value="dark">Donker</option>
            </select>
          </div>

          <div class="settings-actions">
            @if (saveSuccess()) {
              <span class="save-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Opgeslagen!
              </span>
            }
            <button class="btn-save" (click)="saveUserSettings()" [disabled]="saving()">
              {{ saving() ? 'Opslaan...' : 'Opslaan' }}
            </button>
          </div>
        </div>
      }

      @if (!loading() && activeTab() === 'privacy') {
        <div class="settings-card">
          <h2>Privacy & Gegevensbeheer</h2>
          <p class="setting-desc" style="margin-bottom:24px">Beheer je persoonlijke gegevens conform de AVG/GDPR wetgeving.</p>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Mijn data downloaden</span>
              <span class="setting-desc">Download al je persoonlijke data als JSON-bestand (check-ins, doelen, dagboek, gesprekken)</span>
            </div>
            <button class="btn-save" (click)="exportData()" [disabled]="exporting()">
              {{ exporting() ? 'Exporteren...' : 'Download data' }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Opgeslagen gegevens</span>
              <span class="setting-desc">We slaan de volgende categorieën op: profiel, check-ins, doelen, dagboek, gesprekken, oefeningen, inzichten</span>
            </div>
          </div>

          <div class="setting-row setting-row--vertical">
            <div class="setting-info">
              <span class="setting-label">Recente activiteiten</span>
              <span class="setting-desc">De laatste acties in jouw account</span>
            </div>
            <div style="width:100%;margin-top:12px">
              <div *ngFor="let log of auditLog()" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px">
                <span style="color:#374151"><strong>{{ log.action }}</strong> {{ log.resource }}</span>
                <span style="color:#9ca3af">{{ log.createdAt | date:'dd-MM-yyyy HH:mm' }}</span>
              </div>
              <div *ngIf="auditLog().length === 0" style="color:#9ca3af;font-size:13px;padding:8px 0">Geen activiteiten gevonden</div>
            </div>
          </div>

          <div class="setting-row" style="margin-top:24px;padding-top:24px;border-top:2px solid #fee2e2">
            <div class="setting-info">
              <span class="setting-label" style="color:#dc2626">Account verwijderen</span>
              <span class="setting-desc">Verwijder je account permanent. Al je data wordt geanonimiseerd. Dit kan niet ongedaan worden gemaakt.</span>
            </div>
            <button class="btn-delete" (click)="confirmDeleteAccount()">Account verwijderen</button>
          </div>
        </div>

        <!-- Confirm Delete Dialog -->
        <div *ngIf="showDeleteConfirm()" class="confirm-overlay">
          <div class="confirm-dialog">
            <h3>Account definitief verwijderen?</h3>
            <p>Al je persoonlijke data wordt geanonimiseerd en je account wordt permanent verwijderd. Dit kan <strong>niet</strong> worden teruggedraaid.</p>
            <div class="confirm-actions">
              <button class="btn-cancel" (click)="showDeleteConfirm.set(false)">Annuleren</button>
              <button class="btn-delete" (click)="deleteAccount()" [disabled]="deleting()">
                {{ deleting() ? 'Verwijderen...' : 'Ja, verwijder mijn account' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (!loading() && activeTab() === 'coaching') {
        <div class="settings-card">
          <h2>Coaching instellingen</h2>

          <div class="setting-row setting-row--vertical">
            <div class="setting-info">
              <span class="setting-label">Coachingstijl</span>
              <span class="setting-desc">Hoe wil je dat de AI coach met je communiceert?</span>
            </div>
            <div class="style-options">
              @for (style of coachingStyles; track style.value) {
                <button
                  class="style-option"
                  [class.selected]="coachingSettings.coachingStyle === style.value"
                  (click)="coachingSettings.coachingStyle = style.value">
                  <span class="style-icon">{{ style.icon }}</span>
                  <span class="style-name">{{ style.label }}</span>
                  <span class="style-desc">{{ style.desc }}</span>
                </button>
              }
            </div>
          </div>

          <div class="setting-row setting-row--vertical">
            <div class="setting-info">
              <span class="setting-label">Focus gebieden</span>
              <span class="setting-desc">Waar wil je aan werken? (meerdere keuzes mogelijk)</span>
            </div>
            <div class="focus-options">
              @for (area of focusAreaOptions; track area.value) {
                <button
                  class="focus-chip"
                  [class.selected]="isFocusSelected(area.value)"
                  (click)="toggleFocus(area.value)">
                  {{ area.label }}
                </button>
              }
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Weekdoel</span>
              <span class="setting-desc">Hoeveel check-ins wil je per week doen?</span>
            </div>
            <div class="number-input">
              <button (click)="coachingSettings.weeklyGoal = Math.max(1, coachingSettings.weeklyGoal - 1)">−</button>
              <span>{{ coachingSettings.weeklyGoal }}</span>
              <button (click)="coachingSettings.weeklyGoal = Math.min(7, coachingSettings.weeklyGoal + 1)">+</button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Herinneringen</span>
              <span class="setting-desc">Automatische coaching reminders</span>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="coachingSettings.reminderEnabled">
              <span class="toggle-slider"></span>
            </label>
          </div>

          @if (coachingSettings.reminderEnabled) {
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Frequentie</span>
                <span class="setting-desc">Hoe vaak wil je herinneringen ontvangen?</span>
              </div>
              <select class="select-input" [(ngModel)]="coachingSettings.reminderFrequency">
                <option value="daily">Dagelijks</option>
                <option value="weekdays">Werkdagen</option>
                <option value="weekly">Wekelijks</option>
              </select>
            </div>
          }

          <div class="settings-actions">
            @if (saveSuccess()) {
              <span class="save-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Opgeslagen!
              </span>
            }
            <button class="btn-save" (click)="saveCoachingSettings()" [disabled]="saving()">
              {{ saving() ? 'Opslaan...' : 'Opslaan' }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1.25rem;
    }

    .settings-header {
      margin-bottom: 1.5rem;

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 0.25rem;
      }
    }

    .settings-subtitle {
      color: var(--text-light);
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-light);
      cursor: pointer;
      margin-bottom: -1px;
      transition: all var(--transition);

      &:hover {
        color: var(--text);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    .settings-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 1.5rem;
      }
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);

      &:last-of-type {
        border-bottom: none;
      }
    }

    .setting-row--vertical {
      flex-direction: column;
      align-items: flex-start;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .setting-label {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text);
    }

    .setting-desc {
      font-size: 0.8125rem;
      color: var(--text-light);
    }

    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;

      input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      input:checked + .toggle-slider {
        background-color: var(--primary);
      }

      input:checked + .toggle-slider::before {
        transform: translateX(20px);
      }
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--border);
      border-radius: 24px;
      transition: background-color var(--transition);

      &::before {
        content: '';
        position: absolute;
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: transform var(--transition);
      }
    }

    .time-input, .select-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.875rem;
      color: var(--text);
      background: var(--background);
      min-width: 140px;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    .style-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      width: 100%;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .style-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      padding: 1rem;
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--background);
      cursor: pointer;
      transition: all var(--transition);
      text-align: center;

      &:hover {
        border-color: var(--primary);
      }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
      }
    }

    .style-icon {
      font-size: 1.75rem;
    }

    .style-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }

    .style-desc {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .focus-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .focus-chip {
      padding: 0.375rem 0.875rem;
      border: 1.5px solid var(--border);
      border-radius: 999px;
      background: var(--background);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-light);
      cursor: pointer;
      transition: all var(--transition);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        color: var(--primary);
      }
    }

    .number-input {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      button {
        width: 32px;
        height: 32px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--background);
        font-size: 1.125rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text);
        transition: all var(--transition);

        &:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
      }

      span {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
        min-width: 24px;
        text-align: center;
      }
    }

    .settings-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }

    .save-success {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #10b981;
    }

    .btn-save {
      padding: 0.625rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition);

      &:hover:not(:disabled) {
        background: var(--primary-dark, #4f46e5);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 3rem;
      justify-content: center;
      color: var(--text-light);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-delete {
      padding: 0.625rem 1.25rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-dialog { background: white; border-radius: 12px; padding: 32px; max-width: 440px; width: 90%; }
    .confirm-dialog h3 { margin: 0 0 12px; font-size: 18px; color: #dc2626; }
    .confirm-dialog p { margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.6; }
    .confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { padding: 0.625rem 1.25rem; background: white; border: 2px solid #d1d5db; border-radius: var(--radius); font-size: 0.875rem; cursor: pointer; }
  `],
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
    { value: 'supportive', label: 'Ondersteunend', icon: '🤝', desc: 'Warm en bemoedigend' },
    { value: 'challenging', label: 'Uitdagend', icon: '🚀', desc: 'Ambitieus en direct' },
    { value: 'analytical', label: 'Analytisch', icon: '🔍', desc: 'Data-gedreven en logisch' },
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
