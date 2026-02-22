import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalsStore } from '../../core/stores/goals.store';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="goals-page">
      <div class="page-header">
        <h1>Mijn Doelen</h1>
        <p>Stel SMART-doelen en volg je voortgang</p>
      </div>

      @if (!showForm) {
        <div class="goals-header">
          <div class="stats-row">
            <div class="stat-chip">
              <span class="stat-num">{{ goalsStore.activeGoals().length }}</span>
              <span class="stat-lbl">Actief</span>
            </div>
            <div class="stat-chip stat-chip--success">
              <span class="stat-num">{{ goalsStore.completedGoals().length }}</span>
              <span class="stat-lbl">Voltooid</span>
            </div>
            <div class="stat-chip stat-chip--info">
              <span class="stat-num">{{ goalsStore.avgProgress() }}%</span>
              <span class="stat-lbl">Gem. voortgang</span>
            </div>
          </div>
          <button class="btn btn-primary" (click)="showForm = true">+ Nieuw doel</button>
        </div>
      }

      @if (showForm) {
        <div class="card form-card">
          <div class="card-header">
            <h2>Nieuw SMART-doel</h2>
            <button class="btn-close" (click)="cancelForm()">✕</button>
          </div>

          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Titel *</label>
              <input type="text" formControlName="title" placeholder="Naam van je doel" />
            </div>

            <div class="form-group">
              <label>Beschrijving</label>
              <textarea formControlName="description" placeholder="Optionele beschrijving" rows="2"></textarea>
            </div>

            <div class="smart-grid">
              <div class="smart-item">
                <div class="smart-label">
                  <span class="smart-letter">S</span>
                  <span>Specifiek</span>
                </div>
                <textarea formControlName="specific" placeholder="Wat wil je precies bereiken?" rows="2"></textarea>
              </div>
              <div class="smart-item">
                <div class="smart-label">
                  <span class="smart-letter smart-letter--m">M</span>
                  <span>Meetbaar</span>
                </div>
                <textarea formControlName="measurable" placeholder="Hoe meet je de voortgang?" rows="2"></textarea>
              </div>
              <div class="smart-item">
                <div class="smart-label">
                  <span class="smart-letter smart-letter--a">A</span>
                  <span>Haalbaar</span>
                </div>
                <textarea formControlName="achievable" placeholder="Is het realistisch haalbaar?" rows="2"></textarea>
              </div>
              <div class="smart-item">
                <div class="smart-label">
                  <span class="smart-letter smart-letter--r">R</span>
                  <span>Relevant</span>
                </div>
                <textarea formControlName="relevant" placeholder="Waarom is dit doel belangrijk?" rows="2"></textarea>
              </div>
              <div class="smart-item">
                <div class="smart-label">
                  <span class="smart-letter smart-letter--t">T</span>
                  <span>Tijdgebonden</span>
                </div>
                <input type="date" formControlName="timeBound" />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">Annuleren</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting || goalForm.invalid">
                @if (isSubmitting) {
                  <span class="spinner"></span>
                }
                Opslaan
              </button>
            </div>
          </form>
        </div>
      }

      <div class="goals-list">
        @for (goal of goalsStore.goals(); track goal.id) {
          <div class="card goal-card" [class.goal-card--completed]="goal.status === 'completed'">
            <div class="goal-header">
              <div class="goal-title-row">
                <h3>{{ goal.title }}</h3>
                <span class="status-badge" [class]="'status-badge--' + goal.status">
                  {{ getStatusLabel(goal.status) }}
                </span>
              </div>
              @if (goal.description) {
                <p class="goal-desc">{{ goal.description }}</p>
              }
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Voortgang</span>
                <span class="progress-value">{{ goal.progress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="goal.progress"></div>
              </div>
            </div>

            <div class="smart-summary">
              <div class="smart-row"><strong>S:</strong> {{ goal.specific }}</div>
              <div class="smart-row"><strong>M:</strong> {{ goal.measurable }}</div>
              <div class="smart-row"><strong>T:</strong> {{ goal.timeBound | date:'dd MMM yyyy' }}</div>
            </div>

            <div class="goal-actions">
              @if (goal.status === 'active') {
                <div class="progress-update">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    [value]="goal.progress"
                    (change)="updateProgress(goal.id, $event)"
                    class="range-slider"
                  />
                </div>
                <button class="btn btn-secondary btn-sm" (click)="completeGoal(goal.id)">Voltooid</button>
                <button class="btn btn-sm btn-danger-outline" (click)="abandonGoal(goal.id)">Opgeven</button>
              }
              <button class="btn btn-sm btn-ghost" (click)="deleteGoal(goal.id)">Verwijder</button>
            </div>
          </div>
        } @empty {
          @if (!goalsStore.loading()) {
            <div class="empty-state card">
              <div class="empty-icon">🎯</div>
              <h3>Nog geen doelen</h3>
              <p>Stel je eerste SMART-doel in om je groei bij te houden.</p>
              <button class="btn btn-primary" (click)="showForm = true">Eerste doel instellen</button>
            </div>
          }
        }
      </div>

      @if (goalsStore.loading()) {
        <div class="loading-state">
          <span class="spinner spinner--dark"></span>
          <span>Laden...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .goals-page {
      padding: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .page-header p {
      color: var(--text-light);
      font-size: 0.875rem;
      margin: 0.25rem 0 0;
    }

    .goals-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stats-row {
      display: flex;
      gap: 0.75rem;
    }

    .stat-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 1rem;
      background: var(--primary-light);
      border-radius: var(--radius);
      min-width: 70px;
    }

    .stat-chip--success { background: var(--secondary-light, #d1fae5); }
    .stat-chip--info { background: var(--bg); border: 1px solid var(--border); }

    .stat-num {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
    }

    .stat-lbl {
      font-size: 0.6875rem;
      color: var(--text-light);
    }

    .form-card {
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1rem;
      color: var(--text-light);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);

      &:hover { background: var(--surface-hover); }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.375rem;
      }

      input, textarea {
        width: 100%;
        box-sizing: border-box;
      }
    }

    .smart-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .smart-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      textarea, input[type="date"] {
        width: 100%;
        box-sizing: border-box;
      }
    }

    .smart-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text);
    }

    .smart-letter {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .smart-letter--m { background: #8B5CF6; }
    .smart-letter--a { background: #10B981; }
    .smart-letter--r { background: #F59E0B; }
    .smart-letter--t { background: #EF4444; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .goal-card {
      padding: 1.25rem;
      transition: opacity 0.2s ease;

      &.goal-card--completed {
        opacity: 0.7;
      }
    }

    .goal-header {
      margin-bottom: 1rem;
    }

    .goal-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }
    }

    .goal-desc {
      font-size: 0.875rem;
      color: var(--text-light);
      margin: 0.25rem 0 0;
    }

    .status-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .status-badge--active {
      background: var(--primary-light);
      color: var(--primary);
    }

    .status-badge--completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge--abandoned {
      background: #fee2e2;
      color: #991b1b;
    }

    .progress-section {
      margin-bottom: 1rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.375rem;
    }

    .progress-label {
      font-size: 0.8125rem;
      color: var(--text-light);
    }

    .progress-value {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text);
    }

    .progress-bar {
      height: 8px;
      background: var(--bg);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, var(--primary), #60A5FA);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .smart-summary {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: var(--bg);
      border-radius: var(--radius);
      font-size: 0.8125rem;
      color: var(--text-light);

      strong { color: var(--text); }
    }

    .goal-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .progress-update {
      flex: 1;
      min-width: 120px;

      .range-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--border);
        outline: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      }
    }

    .btn-danger-outline {
      background: none;
      border: 1px solid var(--danger);
      color: var(--danger);
      border-radius: var(--radius);
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition);

      &:hover { background: var(--danger-light); }
    }

    .btn-ghost {
      background: none;
      border: none;
      color: var(--text-lighter);
      cursor: pointer;
      padding: 0.375rem 0.5rem;
      font-size: 0.8125rem;
      border-radius: var(--radius);

      &:hover { background: var(--surface-hover); color: var(--text-light); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;

      .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
      h3 { font-size: 1.125rem; font-weight: 600; color: var(--text); margin: 0 0 0.5rem; }
      p { color: var(--text-light); font-size: 0.875rem; margin: 0 0 1.5rem; }
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--text-light);
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

    .spinner--dark {
      border-color: var(--border);
      border-top-color: var(--primary);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #10B981; }
    .alert-error { background-color: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); }
  `],
})
export class GoalsComponent implements OnInit {
  readonly goalsStore = inject(GoalsStore);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  showForm = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  goalForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    specific: ['', Validators.required],
    measurable: ['', Validators.required],
    achievable: ['', Validators.required],
    relevant: ['', Validators.required],
    timeBound: ['', Validators.required],
  });

  ngOnInit(): void {
    this.goalsStore.loadGoals();
    this.goalsStore.loadStats();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Actief',
      completed: 'Voltooid',
      abandoned: 'Opgegeven',
    };
    return labels[status] || status;
  }

  cancelForm(): void {
    this.showForm = false;
    this.goalForm.reset({ title: '', description: '', specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' });
    this.errorMessage = '';
  }

  async onSubmit(): Promise<void> {
    if (this.goalForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.goalsStore.createGoal(this.goalForm.value);
    this.isSubmitting = false;

    if (result) {
      this.successMessage = 'Doel opgeslagen!';
      this.showForm = false;
      this.goalForm.reset();
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    } else {
      this.errorMessage = this.goalsStore.error() || 'Opslaan mislukt.';
    }
    this.cdr.markForCheck();
  }

  async updateProgress(id: string, event: Event): Promise<void> {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    await this.goalsStore.updateGoal(id, { progress: value });
  }

  async completeGoal(id: string): Promise<void> {
    await this.goalsStore.updateGoal(id, { status: 'completed', progress: 100 });
  }

  async abandonGoal(id: string): Promise<void> {
    await this.goalsStore.updateGoal(id, { status: 'abandoned' });
  }

  async deleteGoal(id: string): Promise<void> {
    if (confirm('Weet je zeker dat je dit doel wilt verwijderen?')) {
      await this.goalsStore.deleteGoal(id);
    }
  }
}
