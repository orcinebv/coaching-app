import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalsStore } from '../../core/stores/goals.store';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
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
