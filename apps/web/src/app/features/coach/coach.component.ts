import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Coachee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  organization: { id: string; name: string } | null;
  lastCheckIn: { mood: number; energy: number; createdAt: string } | null;
  hasCrisisAlert: boolean;
}

interface CoacheeOverview {
  user: { id: string; name: string; email: string; avatar: string | null };
  stats: { avgMood: number | null; checkInCount: number; activeGoals: number; hasCrisisAlert: boolean };
  recentCheckIns: { mood: number; energy: number; notes: string | null; createdAt: string }[];
  goals: { id: string; title: string; progress: number; status: string }[];
  latestSentiment: { overall: number; crisis: boolean } | null;
}

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coach-container">
      <div class="coach-header">
        <h1>Coach Dashboard</h1>
        <p class="subtitle">Overzicht van jouw coachees</p>
      </div>

      <!-- Crisis Alerts Banner -->
      <div *ngIf="crisisAlerts().length > 0" class="crisis-banner">
        <span class="crisis-icon">⚠️</span>
        <strong>Let op:</strong> {{ crisisAlerts().length }} coachee(s) tonen crisissignalen.
        <span *ngFor="let alert of crisisAlerts(); let last = last">
          {{ alert.user.name }}<span *ngIf="!last">, </span>
        </span>
      </div>

      <div class="coach-layout">
        <!-- Coachee List -->
        <div class="coachee-list">
          <h2>Coachees ({{ coachees().length }})</h2>
          <div
            *ngFor="let c of coachees()"
            class="coachee-card"
            [class.selected]="selectedCoachee()?.id === c.id"
            [class.crisis]="c.hasCrisisAlert"
            (click)="selectCoachee(c)"
          >
            <div class="coachee-avatar">{{ c.name.charAt(0).toUpperCase() }}</div>
            <div class="coachee-info">
              <div class="coachee-name">
                {{ c.name }}
                <span *ngIf="c.hasCrisisAlert" class="crisis-badge">!</span>
              </div>
              <div class="coachee-email">{{ c.email }}</div>
              <div *ngIf="c.lastCheckIn" class="coachee-mood">
                Stemming: {{ c.lastCheckIn.mood }}/10
              </div>
              <div *ngIf="!c.lastCheckIn" class="coachee-mood no-data">Geen check-in</div>
            </div>
          </div>
          <div *ngIf="coachees().length === 0" class="empty-state">
            Geen coachees toegewezen
          </div>
        </div>

        <!-- Coachee Detail -->
        <div class="coachee-detail" *ngIf="selectedOverview()">
          <div class="detail-header">
            <div class="detail-avatar">{{ selectedOverview()!.user.name.charAt(0).toUpperCase() }}</div>
            <div>
              <h2>{{ selectedOverview()!.user.name }}</h2>
              <p>{{ selectedOverview()!.user.email }}</p>
            </div>
          </div>

          <!-- Alert -->
          <div *ngIf="selectedOverview()!.stats.hasCrisisAlert" class="detail-crisis-alert">
            ⚠️ Crisissignaal gedetecteerd – volg deze coachee actief op
          </div>

          <!-- Stats -->
          <div class="detail-stats">
            <div class="detail-stat">
              <div class="detail-stat-value">{{ selectedOverview()!.stats.avgMood ?? '-' }}</div>
              <div class="detail-stat-label">Gem. stemming</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-value">{{ selectedOverview()!.stats.checkInCount }}</div>
              <div class="detail-stat-label">Check-ins (14d)</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-value">{{ selectedOverview()!.stats.activeGoals }}</div>
              <div class="detail-stat-label">Actieve doelen</div>
            </div>
          </div>

          <!-- Mood chart (simplified) -->
          <div class="section">
            <h3>Recente stemming</h3>
            <div class="mood-chart">
              <div
                *ngFor="let ci of selectedOverview()!.recentCheckIns.slice(0, 10)"
                class="mood-bar"
                [style.height.px]="ci.mood * 8"
                [title]="'Stemming: ' + ci.mood + ', Energie: ' + ci.energy"
              ></div>
            </div>
          </div>

          <!-- Goals -->
          <div class="section">
            <h3>Actieve doelen</h3>
            <div *ngFor="let goal of selectedOverview()!.goals" class="goal-item">
              <div class="goal-title">{{ goal.title }}</div>
              <div class="goal-progress-bar">
                <div class="goal-progress-fill" [style.width.%]="goal.progress"></div>
              </div>
              <span class="goal-pct">{{ goal.progress }}%</span>
            </div>
            <div *ngIf="selectedOverview()!.goals.length === 0" class="empty-state">Geen actieve doelen</div>
          </div>

          <!-- Notes -->
          <div class="section">
            <h3>Coaching notities</h3>
            <div class="note-input">
              <textarea [(ngModel)]="newNote" placeholder="Voeg een notitie toe..." rows="3"></textarea>
              <button (click)="addNote()" class="btn-primary">Notitie opslaan</button>
            </div>
            <div *ngFor="let note of notes()" class="note-item">
              <p>{{ note.content }}</p>
              <small>{{ note.createdAt | date:'dd-MM-yyyy HH:mm' }}</small>
            </div>
          </div>
        </div>

        <div class="coachee-detail empty-detail" *ngIf="!selectedOverview()">
          <p>Selecteer een coachee om details te bekijken</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coach-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .coach-header { margin-bottom: 20px; }
    .coach-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .crisis-banner { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: #92400e; }
    .crisis-icon { font-size: 18px; }
    .coach-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .coachee-list h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .coachee-card { background: white; border-radius: 10px; padding: 14px; cursor: pointer; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 12px; border: 2px solid transparent; transition: all 0.15s; }
    .coachee-card:hover, .coachee-card.selected { border-color: #6c63ff; }
    .coachee-card.crisis { border-left: 4px solid #ef4444; }
    .coachee-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #9b59b6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .coachee-name { font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .coachee-email { font-size: 12px; color: #666; }
    .coachee-mood { font-size: 12px; color: #6c63ff; margin-top: 2px; }
    .coachee-mood.no-data { color: #9ca3af; }
    .crisis-badge { background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
    .empty-state { color: #9ca3af; font-size: 14px; text-align: center; padding: 20px; }
    .coachee-detail { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .empty-detail { display: flex; align-items: center; justify-content: center; min-height: 300px; }
    .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .detail-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #9b59b6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; }
    .detail-header h2 { margin: 0; font-size: 20px; }
    .detail-header p { margin: 0; color: #666; font-size: 14px; }
    .detail-crisis-alert { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; color: #991b1b; font-size: 14px; }
    .detail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .detail-stat { background: #f9fafb; border-radius: 8px; padding: 14px; text-align: center; }
    .detail-stat-value { font-size: 24px; font-weight: 700; color: #6c63ff; }
    .detail-stat-label { font-size: 12px; color: #666; margin-top: 2px; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
    .mood-chart { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
    .mood-bar { flex: 1; background: linear-gradient(to top, #6c63ff, #9b59b6); border-radius: 3px 3px 0 0; min-height: 4px; }
    .goal-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .goal-title { font-size: 13px; min-width: 150px; flex: 1; }
    .goal-progress-bar { flex: 2; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .goal-progress-fill { height: 100%; background: linear-gradient(to right, #6c63ff, #9b59b6); border-radius: 4px; }
    .goal-pct { font-size: 12px; color: #6b7280; min-width: 36px; text-align: right; }
    .note-input { margin-bottom: 16px; }
    .note-input textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; resize: none; font-size: 14px; margin-bottom: 8px; box-sizing: border-box; }
    .btn-primary { padding: 8px 16px; background: #6c63ff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .note-item { background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .note-item p { margin: 0 0 4px; font-size: 14px; }
    .note-item small { color: #9ca3af; font-size: 12px; }
  `],
})
export class CoachComponent implements OnInit {
  coachees = signal<Coachee[]>([]);
  selectedCoachee = signal<Coachee | null>(null);
  selectedOverview = signal<CoacheeOverview | null>(null);
  crisisAlerts = signal<{ user: { name: string } }[]>([]);
  notes = signal<{ content: string; createdAt: string }[]>([]);
  newNote = '';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCoachees();
    this.loadCrisisAlerts();
  }

  loadCoachees() {
    this.http.get<Coachee[]>(`${this.apiUrl}/coach/coachees`).subscribe((c) => this.coachees.set(c));
  }

  loadCrisisAlerts() {
    this.http.get<{ user: { name: string } }[]>(`${this.apiUrl}/coach/alerts`).subscribe((a) => this.crisisAlerts.set(a));
  }

  selectCoachee(coachee: Coachee) {
    this.selectedCoachee.set(coachee);
    this.http
      .get<CoacheeOverview>(`${this.apiUrl}/coach/coachees/${coachee.id}/overview`)
      .subscribe((o) => this.selectedOverview.set(o));
    this.http
      .get<{ content: string; createdAt: string }[]>(`${this.apiUrl}/coach/coachees/${coachee.id}/notes`)
      .subscribe((n) => this.notes.set(n));
  }

  addNote() {
    if (!this.newNote.trim() || !this.selectedCoachee()) return;
    this.http
      .post<{ content: string; createdAt: string }>(`${this.apiUrl}/coach/coachees/${this.selectedCoachee()!.id}/notes`, {
        content: this.newNote,
      })
      .subscribe((note) => {
        this.notes.update((n) => [note, ...n]);
        this.newNote = '';
      });
  }
}
