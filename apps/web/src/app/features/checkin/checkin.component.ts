import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Moon, Droplets, Activity, ClipboardList } from 'lucide-angular';
import { CheckInStore } from '../../core/stores/checkin.store';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
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

  readonly MoonIcon = Moon;
  readonly DropletsIcon = Droplets;
  readonly ActivityIcon = Activity;
  readonly ClipboardListIcon = ClipboardList;

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

  getMoodClass(value: number): string {
    if (value <= 3) return 'level-low';
    if (value <= 6) return 'level-mid';
    return 'level-high';
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
