import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckInStore } from '../../core/stores/checkin.store';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkin-page">
      <div class="checkin-container">
        <section class="new-checkin card">
          <h2>New Check-in</h2>
          <p class="section-desc">How are you feeling today?</p>

          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="checkinForm" (ngSubmit)="onSubmit()">
            <div class="slider-group">
              <div class="slider-header">
                <label>Mood</label>
                <span class="slider-display">
                  <span class="slider-emoji">{{ getMoodEmoji(checkinForm.get('mood')?.value) }}</span>
                  <span class="slider-value">{{ checkinForm.get('mood')?.value }}/10</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                formControlName="mood"
                class="range-slider mood-slider"
              />
              <div class="slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <label>Energy</label>
                <span class="slider-display">
                  <span class="slider-emoji">{{ getEnergyEmoji(checkinForm.get('energy')?.value) }}</span>
                  <span class="slider-value">{{ checkinForm.get('energy')?.value }}/10</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                formControlName="energy"
                class="range-slider energy-slider"
              />
              <div class="slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                formControlName="notes"
                placeholder="How are you feeling? What's on your mind?"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="goals">Goals</label>
              <textarea
                id="goals"
                formControlName="goals"
                placeholder="What do you want to accomplish today?"
                rows="3"
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              [disabled]="isSubmitting"
            >
              @if (isSubmitting) {
                <span class="spinner"></span>
                Saving...
              } @else {
                Save Check-in
              }
            </button>
          </form>
        </section>

        <section class="history-section">
          <h2>Check-in History</h2>
          <div class="history-list">
            @for (checkin of checkInStore.checkIns(); track checkin.id) {
              <div class="history-item card">
                <div class="history-header">
                  <span class="history-date">{{ checkin.createdAt | date:'EEEE, MMM d, y' }}</span>
                </div>
                <div class="history-metrics">
                  <div class="history-metric">
                    <span class="metric-emoji">{{ getMoodEmoji(checkin.mood) }}</span>
                    <div class="metric-info">
                      <span class="metric-label">Mood</span>
                      <div class="metric-bar">
                        <div class="metric-fill mood-fill" [style.width.%]="checkin.mood * 10"></div>
                      </div>
                      <span class="metric-value">{{ checkin.mood }}/10</span>
                    </div>
                  </div>
                  <div class="history-metric">
                    <span class="metric-emoji">{{ getEnergyEmoji(checkin.energy) }}</span>
                    <div class="metric-info">
                      <span class="metric-label">Energy</span>
                      <div class="metric-bar">
                        <div class="metric-fill energy-fill" [style.width.%]="checkin.energy * 10"></div>
                      </div>
                      <span class="metric-value">{{ checkin.energy }}/10</span>
                    </div>
                  </div>
                </div>
                @if (checkin.notes) {
                  <div class="history-notes">
                    <strong>Notes:</strong> {{ checkin.notes }}
                  </div>
                }
                @if (checkin.goals) {
                  <div class="history-goals">
                    <strong>Goals:</strong> {{ checkin.goals }}
                  </div>
                }
              </div>
            } @empty {
              <div class="empty-state card">
                <p>No check-ins yet. Create your first one above!</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .checkin-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .new-checkin {
      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
      }

      .section-desc {
        color: var(--text-light);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        margin-bottom: 1.5rem;
      }
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .alert-success {
      background-color: var(--secondary-light);
      color: var(--secondary);
      border: 1px solid var(--secondary);
    }

    .alert-error {
      background-color: var(--danger-light);
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .slider-group {
      margin-bottom: 1.5rem;
    }

    .slider-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
      }
    }

    .slider-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slider-emoji {
      font-size: 1.5rem;
    }

    .slider-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      min-width: 40px;
    }

    .range-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 8px;
      border-radius: 4px;
      outline: none;
      border: none;
      padding: 0;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid #fff;
        box-shadow: var(--shadow-md);
      }

      &:focus {
        box-shadow: none;
      }
    }

    .mood-slider {
      background: linear-gradient(to right, #EF4444, #F59E0B, #10B981);

      &::-webkit-slider-thumb {
        background: var(--primary);
      }
    }

    .energy-slider {
      background: linear-gradient(to right, #6B7280, #F59E0B, #10B981);

      &::-webkit-slider-thumb {
        background: var(--secondary);
      }
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.6875rem;
      color: var(--text-lighter);
      margin-top: 0.375rem;
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.375rem;
      }
    }

    button[type="submit"] {
      padding: 0.75rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .history-section {
      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 1rem;
      }
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-item {
      padding: 1.25rem;
    }

    .history-header {
      margin-bottom: 0.75rem;
    }

    .history-date {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }

    .history-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .history-metric {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .metric-emoji {
      font-size: 1.25rem;
      min-width: 28px;
      text-align: center;
    }

    .metric-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--text-light);
      min-width: 44px;
    }

    .metric-bar {
      flex: 1;
      height: 8px;
      background-color: var(--bg);
      border-radius: 4px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .mood-fill {
      background: linear-gradient(to right, var(--primary), #60A5FA);
    }

    .energy-fill {
      background: linear-gradient(to right, var(--secondary), #34D399);
    }

    .metric-value {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text);
      min-width: 36px;
      text-align: right;
    }

    .history-notes,
    .history-goals {
      font-size: 0.8125rem;
      color: var(--text-light);
      line-height: 1.5;
      margin-top: 0.5rem;

      strong {
        color: var(--text);
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
      font-size: 0.875rem;
    }
  `],
})
export class CheckinComponent implements OnInit {
  readonly checkInStore = inject(CheckInStore);
  private cdr = inject(ChangeDetectorRef);
  checkinForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.checkinForm = this.fb.group({
      mood: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      energy: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      notes: [''],
      goals: [''],
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

  async onSubmit(): Promise<void> {
    if (this.checkinForm.invalid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.checkInStore.createCheckIn(this.checkinForm.value);
      this.isSubmitting = false;

      if (result) {
        this.successMessage = 'Check-in saved successfully!';
        this.checkinForm.patchValue({ mood: 5, energy: 5, notes: '', goals: '' });
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      } else {
        this.errorMessage = this.checkInStore.error() || 'Failed to save check-in. Please try again.';
      }
    } catch {
      this.isSubmitting = false;
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
    this.cdr.markForCheck();
  }
}
