import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JournalStore } from '../../core/stores/journal.store';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="journal-page">
      <div class="page-header">
        <h1>Dagboek</h1>
        <p>Schrijf en reflecteer op je gedachten en gevoelens</p>
      </div>

      <div class="journal-layout">
        <div class="new-entry card">
          <div class="prompt-section">
            <div class="prompt-label">Dagelijkse prompt</div>
            <div class="prompt-text">{{ journalStore.dailyPrompt() }}</div>
          </div>

          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="entryForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Jouw reflectie *</label>
              <textarea
                formControlName="content"
                [placeholder]="journalStore.dailyPrompt() || 'Hoe was je dag? Wat gaat er door je heen?'"
                rows="6"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group mood-group">
                <label>Stemming (optioneel)</label>
                <div class="mood-select">
                  @for (val of moodValues; track val) {
                    <button
                      type="button"
                      class="mood-btn"
                      [class.mood-btn--active]="entryForm.get('mood')?.value === val"
                      (click)="setMood(val)"
                    >
                      {{ getMoodEmoji(val) }}
                    </button>
                  }
                </div>
              </div>

              <div class="form-group tags-group">
                <label>Tags (optioneel)</label>
                <div class="tags-input">
                  <div class="tag-chips">
                    @for (tag of selectedTags; track tag) {
                      <span class="tag-chip">
                        {{ tag }}
                        <button type="button" (click)="removeTag(tag)">×</button>
                      </span>
                    }
                  </div>
                  <div class="tag-suggestions">
                    @for (tag of availableTags; track tag) {
                      <button type="button" class="tag-suggestion" (click)="addTag(tag)">{{ tag }}</button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="isSubmitting || entryForm.invalid">
              @if (isSubmitting) { <span class="spinner"></span> }
              Opslaan
            </button>
          </form>
        </div>

        <div class="entries-section">
          <div class="section-header">
            <h2>Eerdere Entries</h2>
            <span class="count-badge">{{ journalStore.total() }} totaal</span>
          </div>

          @if (journalStore.loading()) {
            <div class="loading-state">
              <span class="spinner spinner--dark"></span>
            </div>
          }

          <div class="entries-list">
            @for (entry of journalStore.entries(); track entry.id) {
              <div class="card entry-card">
                <div class="entry-header">
                  <span class="entry-date">{{ entry.createdAt | date:'EEEE, d MMMM yyyy' }}</span>
                  @if (entry.mood) {
                    <span class="entry-mood">{{ getMoodEmoji(entry.mood) }}</span>
                  }
                </div>

                @if (entry.prompt) {
                  <div class="entry-prompt">{{ entry.prompt }}</div>
                }

                <div class="entry-content">{{ entry.content }}</div>

                @if (entry.tags && entry.tags.length > 0) {
                  <div class="entry-tags">
                    @for (tag of entry.tags; track tag) {
                      <span class="tag-chip tag-chip--sm">{{ tag }}</span>
                    }
                  </div>
                }

                <div class="entry-actions">
                  <button class="btn-ghost-sm" (click)="deleteEntry(entry.id)">Verwijder</button>
                </div>
              </div>
            } @empty {
              @if (!journalStore.loading()) {
                <div class="empty-state card">
                  <div class="empty-icon">📔</div>
                  <h3>Begin met schrijven</h3>
                  <p>Je eerste entry wacht op je. Neem een moment om te reflecteren.</p>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .journal-page {
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

    .journal-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .new-entry {
      padding: 1.25rem;
    }

    .prompt-section {
      background: var(--primary-light);
      border-radius: var(--radius);
      padding: 1rem;
      margin-bottom: 1.25rem;
    }

    .prompt-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      margin-bottom: 0.375rem;
    }

    .prompt-text {
      font-size: 0.9375rem;
      color: var(--text);
      font-style: italic;
      line-height: 1.5;
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

      textarea { width: 100%; box-sizing: border-box; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .mood-select {
      display: flex;
      gap: 0.375rem;
    }

    .mood-btn {
      width: 36px;
      height: 36px;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      background: none;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all var(--transition);

      &:hover, &.mood-btn--active {
        border-color: var(--primary);
        background: var(--primary-light);
      }
    }

    .tags-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .tag-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      min-height: 28px;
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.625rem;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;

      button {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        padding: 0;
        font-size: 0.875rem;
        line-height: 1;
      }

      &.tag-chip--sm {
        font-size: 0.6875rem;
        padding: 0.1875rem 0.5rem;
      }
    }

    .tag-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .tag-suggestion {
      padding: 0.1875rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: none;
      font-size: 0.6875rem;
      color: var(--text-light);
      cursor: pointer;
      transition: all var(--transition);

      &:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    }

    .w-full { width: 100%; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
    }

    .count-badge {
      font-size: 0.75rem;
      color: var(--text-light);
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
    }

    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .entry-card {
      padding: 1rem;
    }

    .entry-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .entry-date {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-light);
    }

    .entry-mood { font-size: 1.25rem; }

    .entry-prompt {
      font-size: 0.75rem;
      color: var(--primary);
      font-style: italic;
      margin-bottom: 0.5rem;
    }

    .entry-content {
      font-size: 0.875rem;
      color: var(--text);
      line-height: 1.6;
      margin-bottom: 0.5rem;
      white-space: pre-wrap;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .entry-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .entry-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.625rem;
    }

    .btn-ghost-sm {
      background: none;
      border: none;
      color: var(--text-lighter);
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);

      &:hover { background: var(--surface-hover); color: var(--text-light); }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;

      .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
      h3 { font-size: 1rem; font-weight: 600; color: var(--text); margin: 0 0 0.375rem; }
      p { color: var(--text-light); font-size: 0.8125rem; margin: 0; }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 1.5rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
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

    .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #10B981; }
    .alert-error { background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); }
  `],
})
export class JournalComponent implements OnInit {
  readonly journalStore = inject(JournalStore);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  selectedTags: string[] = [];

  moodValues = [1, 3, 5, 7, 9];
  availableTags = ['dankbaar', 'uitdaging', 'succes', 'stress', 'leren', 'energie', 'rust'];

  entryForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(10)]],
    mood: [null],
  });

  ngOnInit(): void {
    this.journalStore.loadEntries();
    this.journalStore.loadDailyPrompt();
  }

  getMoodEmoji(value: number): string {
    if (value <= 2) return '😢';
    if (value <= 4) return '😕';
    if (value <= 6) return '😐';
    if (value <= 8) return '😊';
    return '😄';
  }

  setMood(value: number): void {
    const current = this.entryForm.get('mood')?.value;
    this.entryForm.patchValue({ mood: current === value ? null : value });
  }

  addTag(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags = [...this.selectedTags, tag];
    }
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
  }

  async onSubmit(): Promise<void> {
    if (this.entryForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.journalStore.createEntry({
      prompt: this.journalStore.dailyPrompt() || undefined,
      content: this.entryForm.value.content,
      mood: this.entryForm.value.mood || undefined,
      tags: this.selectedTags,
    });

    this.isSubmitting = false;

    if (result) {
      this.successMessage = 'Entry opgeslagen!';
      this.entryForm.reset();
      this.selectedTags = [];
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    } else {
      this.errorMessage = this.journalStore.error() || 'Opslaan mislukt.';
    }
    this.cdr.markForCheck();
  }

  async deleteEntry(id: string): Promise<void> {
    if (confirm('Weet je zeker dat je deze entry wilt verwijderen?')) {
      await this.journalStore.deleteEntry(id);
    }
  }
}
