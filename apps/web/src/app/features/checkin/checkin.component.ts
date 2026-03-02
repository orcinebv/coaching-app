import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckInStore } from '../../core/stores/checkin.store';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
})
export class CheckinComponent implements OnInit {
  readonly checkInStore = inject(CheckInStore);
  private cdr = inject(ChangeDetectorRef);
  checkinForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showHealthSection = signal(false);

  constructor(private fb: FormBuilder) {
    this.checkinForm = this.fb.group({
      mood: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      energy: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      notes: [''],
      goals: [''],
      sleepHours: [null],
      sleepQuality: [null],
      waterGlasses: [null],
      activityMinutes: [null],
      stressLevel: [null],
    });
  }

  ngOnInit(): void {
    this.checkInStore.loadCheckIns();
  }

  getMoodEmoji(value: number): string {
    if (value <= 2) return '\u{1F622}';
    if (value <= 4) return '\u{1F615}';
    if (value <= 6) return '\u{1F610}';
    if (value <= 8) return '\u{1F60A}';
    return '\u{1F604}';
  }

  getEnergyEmoji(value: number): string {
    if (value <= 2) return '\u{1F634}';
    if (value <= 4) return '\u{1F971}';
    if (value <= 6) return '\u{1F610}';
    if (value <= 8) return '\u{26A1}';
    return '\u{1F525}';
  }

  getSleepEmoji(hours: number): string {
    if (!hours && hours !== 0) return '\u{1F634}';
    if (hours < 5) return '\u{1F635}';
    if (hours < 7) return '\u{1F62A}';
    if (hours <= 9) return '\u{1F634}';
    return '\u{1F6CC}';
  }

  getStressEmoji(level: number): string {
    if (!level) return '\u{1F60C}';
    if (level <= 3) return '\u{1F60C}';
    if (level <= 5) return '\u{1F610}';
    if (level <= 7) return '\u{1F630}';
    return '\u{1F631}';
  }

  async onSubmit(): Promise<void> {
    if (this.checkinForm.invalid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const formValue = this.checkinForm.value;
      const data: any = {
        mood: formValue.mood,
        energy: formValue.energy,
        notes: formValue.notes || undefined,
        goals: formValue.goals || undefined,
      };

      if (this.showHealthSection()) {
        if (formValue.sleepHours !== null) data.sleepHours = formValue.sleepHours;
        if (formValue.sleepQuality !== null) data.sleepQuality = formValue.sleepQuality;
        if (formValue.waterGlasses !== null) data.waterGlasses = formValue.waterGlasses;
        if (formValue.activityMinutes !== null) data.activityMinutes = formValue.activityMinutes;
        if (formValue.stressLevel !== null) data.stressLevel = formValue.stressLevel;
      }

      const result = await this.checkInStore.createCheckIn(data);
      this.isSubmitting = false;

      if (result) {
        this.successMessage = 'Check-in opgeslagen!';
        this.checkinForm.patchValue({
          mood: 5, energy: 5, notes: '', goals: '',
          sleepHours: null, sleepQuality: null, waterGlasses: null,
          activityMinutes: null, stressLevel: null,
        });
        this.showHealthSection.set(false);
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      } else {
        this.errorMessage = this.checkInStore.error() || 'Opslaan mislukt. Probeer opnieuw.';
      }
    } catch {
      this.isSubmitting = false;
      this.errorMessage = 'Er is een onverwachte fout opgetreden. Probeer opnieuw.';
    }
    this.cdr.markForCheck();
  }
}
