import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Leaf, Zap, Heart, Dumbbell, Lightbulb, Rocket, Hand, Target, BarChart2, CheckCircle2, Frown, Smile, Moon } from 'lucide-angular';
import { environment } from '../../../environments/environment';

const FOCUS_AREAS = [
  { id: 'stress', label: 'Stress & Ontspanning', icon: Leaf },
  { id: 'productivity', label: 'Productiviteit', icon: Zap },
  { id: 'relationships', label: 'Relaties', icon: Heart },
  { id: 'health', label: 'Gezondheid', icon: Dumbbell },
  { id: 'mindset', label: 'Mindset', icon: Lightbulb },
  { id: 'career', label: 'Carrière', icon: Rocket },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  currentStep = signal(1);
  totalSteps = 4;
  userName = '';
  selectedAreas = signal<string[]>([]);
  moodScore = signal(5);
  energyScore = signal(5);
  focusAreas = FOCUS_AREAS;

  readonly HandIcon = Hand;
  readonly TargetIcon = Target;
  readonly BarChart2Icon = BarChart2;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly FrownIcon = Frown;
  readonly SmileIcon = Smile;
  readonly MoonIcon = Moon;
  readonly ZapIcon = Zap;

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
