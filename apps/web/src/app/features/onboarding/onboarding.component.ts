import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const FOCUS_AREAS = [
  { id: 'stress', label: 'Stress & Ontspanning', icon: '🧘' },
  { id: 'productivity', label: 'Productiviteit', icon: '⚡' },
  { id: 'relationships', label: 'Relaties', icon: '❤️' },
  { id: 'health', label: 'Gezondheid', icon: '💪' },
  { id: 'mindset', label: 'Mindset', icon: '🧠' },
  { id: 'career', label: 'Carrière', icon: '🚀' },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="onboarding-overlay">
      <div class="onboarding-card">
        <!-- Progress -->
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(currentStep() / totalSteps) * 100"></div>
        </div>
        <div class="step-indicator">Stap {{ currentStep() }} van {{ totalSteps }}</div>

        <!-- Step 1: Welcome -->
        <div *ngIf="currentStep() === 1" class="step-content">
          <div class="step-icon">👋</div>
          <h2>Welkom bij jouw coaching app!</h2>
          <p>We helpen je stap voor stap op weg. Dit duurt maar 2 minuten.</p>
          <div class="form-group">
            <label>Hoe wil je aangesproken worden?</label>
            <input [(ngModel)]="userName" placeholder="Jouw naam" class="form-input" />
          </div>
        </div>

        <!-- Step 2: Focus areas -->
        <div *ngIf="currentStep() === 2" class="step-content">
          <div class="step-icon">🎯</div>
          <h2>Wat wil je verbeteren?</h2>
          <p>Kies één of meer focusgebieden (je kunt dit later wijzigen)</p>
          <div class="focus-grid">
            <div
              *ngFor="let area of focusAreas"
              class="focus-item"
              [class.selected]="selectedAreas().includes(area.id)"
              (click)="toggleArea(area.id)"
            >
              <span class="focus-icon">{{ area.icon }}</span>
              <span class="focus-label">{{ area.label }}</span>
            </div>
          </div>
        </div>

        <!-- Step 3: First check-in -->
        <div *ngIf="currentStep() === 3" class="step-content">
          <div class="step-icon">📊</div>
          <h2>Hoe voel je je nu?</h2>
          <p>Doe je eerste check-in om een startpunt te bepalen</p>
          <div class="checkin-group">
            <label>Stemming ({{ moodScore() }}/10)</label>
            <input type="range" min="1" max="10" [(ngModel)]="moodScore" class="range-input" />
            <div class="range-labels"><span>😞 Slecht</span><span>😄 Geweldig</span></div>
          </div>
          <div class="checkin-group">
            <label>Energie ({{ energyScore() }}/10)</label>
            <input type="range" min="1" max="10" [(ngModel)]="energyScore" class="range-input" />
            <div class="range-labels"><span>😴 Laag</span><span>⚡ Hoog</span></div>
          </div>
        </div>

        <!-- Step 4: Done! -->
        <div *ngIf="currentStep() === 4" class="step-content center">
          <div class="step-icon big">🎉</div>
          <h2>Je bent klaar, {{ userName }}!</h2>
          <p>Je profiel is ingesteld. Ga naar je dashboard om te beginnen.</p>
          <div class="summary">
            <div class="summary-item">✅ Naam ingesteld</div>
            <div class="summary-item">✅ Focusgebieden gekozen</div>
            <div class="summary-item">✅ Eerste check-in gedaan</div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-buttons">
          <button *ngIf="currentStep() > 1 && currentStep() < 4" (click)="prevStep()" class="btn-secondary">
            Terug
          </button>
          <button *ngIf="currentStep() < 3" (click)="nextStep()" class="btn-primary" [disabled]="!canProceed()">
            Volgende
          </button>
          <button *ngIf="currentStep() === 3" (click)="submitCheckinAndNext()" class="btn-primary">
            Check-in opslaan
          </button>
          <button *ngIf="currentStep() === 4" (click)="finish()" class="btn-primary">
            Naar dashboard
          </button>
          <button *ngIf="currentStep() < 4" (click)="skip()" class="btn-skip">
            Overslaan
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .onboarding-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .progress-bar { height: 6px; background: #e5e7eb; border-radius: 3px; margin-bottom: 8px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(to right, #6c63ff, #9b59b6); border-radius: 3px; transition: width 0.3s ease; }
    .step-indicator { font-size: 12px; color: #9ca3af; margin-bottom: 24px; }
    .step-content { min-height: 280px; }
    .step-icon { font-size: 48px; margin-bottom: 16px; }
    .step-icon.big { font-size: 64px; }
    .step-content.center { text-align: center; }
    h2 { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
    p { color: #6b7280; margin: 0 0 20px; }
    .form-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .form-input { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; outline: none; box-sizing: border-box; }
    .form-input:focus { border-color: #6c63ff; }
    .focus-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .focus-item { border: 2px solid #e5e7eb; border-radius: 10px; padding: 14px 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.15s; }
    .focus-item:hover { border-color: #6c63ff; }
    .focus-item.selected { border-color: #6c63ff; background: #f0eeff; }
    .focus-icon { font-size: 22px; }
    .focus-label { font-size: 13px; font-weight: 500; }
    .checkin-group { margin-bottom: 20px; }
    .checkin-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .range-input { width: 100%; accent-color: #6c63ff; }
    .range-labels { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .summary { background: #f9fafb; border-radius: 10px; padding: 16px; margin-top: 20px; display: inline-block; text-align: left; }
    .summary-item { padding: 4px 0; font-size: 14px; color: #374151; }
    .nav-buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; }
    .btn-primary { padding: 12px 28px; background: linear-gradient(135deg, #6c63ff, #9b59b6); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 12px 20px; background: white; color: #374151; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px; cursor: pointer; }
    .btn-skip { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 13px; text-decoration: underline; }
  `],
})
export class OnboardingComponent {
  currentStep = signal(1);
  totalSteps = 4;
  userName = '';
  selectedAreas = signal<string[]>([]);
  moodScore = signal(5);
  energyScore = signal(5);
  focusAreas = FOCUS_AREAS;

  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  canProceed(): boolean {
    if (this.currentStep() === 1) return this.userName.trim().length >= 2;
    if (this.currentStep() === 2) return this.selectedAreas().length > 0;
    return true;
  }

  toggleArea(id: string) {
    this.selectedAreas.update((areas) =>
      areas.includes(id) ? areas.filter((a) => a !== id) : [...areas, id],
    );
  }

  nextStep() {
    if (this.currentStep() === 1) {
      this.http.patch(`${this.apiUrl}/users/me`, { name: this.userName }).subscribe();
      this.http.patch(`${this.apiUrl}/users/me/coaching-settings`, {
        focusAreas: JSON.stringify(this.selectedAreas()),
      }).subscribe();
    }
    this.currentStep.update((s) => s + 1);
  }

  prevStep() {
    this.currentStep.update((s) => s - 1);
  }

  submitCheckinAndNext() {
    this.http
      .post(`${this.apiUrl}/checkins`, {
        mood: this.moodScore(),
        energy: this.energyScore(),
        notes: 'Eerste check-in via onboarding',
      })
      .subscribe(() => {
        this.currentStep.set(4);
      });
  }

  finish() {
    this.http.patch(`${this.apiUrl}/users/me/onboarding-complete`, {}).subscribe();
    this.router.navigate(['/dashboard']);
  }

  skip() {
    this.http.patch(`${this.apiUrl}/users/me/onboarding-complete`, {}).subscribe();
    this.router.navigate(['/dashboard']);
  }
}
