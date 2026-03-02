import { Component, OnInit, inject, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalStore } from '../../core/stores/journal.store';
import { JournalEntry } from '@coaching-app/shared/types';

interface EmotionCategory {
  type: 'positive' | 'neutral' | 'negative';
  label: string;
  emotions: string[];
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
})
export class JournalComponent implements OnInit {
  readonly journalStore = inject(JournalStore);
  private cdr = inject(ChangeDetectorRef);

  // New entry form
  step = signal<1 | 2 | 3 | 4>(1);
  selectedEmotion = signal<string | null>(null);
  sliderValue = signal<number>(50);
  selectedFactors = signal<string[]>([]);
  noteValue = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Edit mode
  editingId = signal<string | null>(null);
  editEmotion = signal<string | null>(null);
  editSliderValue = signal<number>(50);
  editFactors = signal<string[]>([]);
  editNoteValue = '';
  isUpdating = signal(false);

  // Filters
  filterEmotionCat = signal<string | null>(null);
  filterDateFrom = signal<string | null>(null);
  filterDateTo = signal<string | null>(null);
  showFilters = signal(false);

  readonly steps = [
    { num: 1, label: 'Gevoel' },
    { num: 2, label: 'Schaal' },
    { num: 3, label: 'Factoren' },
    { num: 4, label: 'Notitie' },
  ];

  readonly emotionCategories: EmotionCategory[] = [
    {
      type: 'positive',
      label: 'Positief',
      emotions: ['Blij', 'Kalm', 'Opgewekt', 'Zelfverzekerd', 'Dankbaar', 'Ontspannen'],
    },
    {
      type: 'neutral',
      label: 'Neutraal',
      emotions: ['Neutraal', 'Bedachtzaam', 'Moe', 'Afwezig', 'Geconcentreerd'],
    },
    {
      type: 'negative',
      label: 'Negatief',
      emotions: ['Verdrietig', 'Boos', 'Angstig', 'Gestrest', 'Teleurgesteld', 'Gefrustreerd'],
    },
  ];

  readonly availableFactors = [
    'Werk/Studie', 'Familie', 'Vrienden', 'Gezondheid',
    'Financiën', 'Thuis', 'Doelen', 'Vrije tijd',
  ];

  filteredEntries = computed(() => {
    let entries = this.journalStore.entries();
    const cat = this.filterEmotionCat();
    const from = this.filterDateFrom();
    const to = this.filterDateTo();

    if (cat) {
      const catEmotions = this.emotionCategories.find(c => c.type === cat)?.emotions ?? [];
      entries = entries.filter(e => e.emotion && catEmotions.includes(e.emotion));
    }
    if (from) {
      const fromDate = new Date(from);
      entries = entries.filter(e => e.createdAt && new Date(e.createdAt) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      entries = entries.filter(e => e.createdAt && new Date(e.createdAt) <= toDate);
    }
    return entries;
  });

  ngOnInit(): void {
    this.journalStore.loadEntries();
  }

  selectEmotion(emotion: string): void {
    this.selectedEmotion.set(this.selectedEmotion() === emotion ? null : emotion);
  }

  goToStep(s: 1 | 2 | 3 | 4): void {
    this.step.set(s);
  }

  getSliderLabel(val?: number): string {
    const v = val ?? this.sliderValue();
    if (v <= 33) return 'Onaangenaam';
    if (v <= 66) return 'Neutraal';
    return 'Aangenaam';
  }

  getSliderClass(val?: number): string {
    const v = val ?? this.sliderValue();
    if (v <= 33) return 'unpleasant';
    if (v <= 66) return 'slider-neutral';
    return 'pleasant';
  }

  toggleFactor(factor: string): void {
    const current = this.selectedFactors();
    this.selectedFactors.set(
      current.includes(factor) ? current.filter(f => f !== factor) : [...current, factor]
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedEmotion()) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const result = await this.journalStore.createEntry({
      emotion: this.selectedEmotion()!,
      sliderValue: this.sliderValue(),
      factors: this.selectedFactors(),
      content: this.noteValue || undefined,
    });

    this.isSubmitting = false;

    if (result) {
      this.successMessage = 'Opgeslagen!';
      this.step.set(1);
      this.selectedEmotion.set(null);
      this.sliderValue.set(50);
      this.selectedFactors.set([]);
      this.noteValue = '';
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    } else {
      this.errorMessage = this.journalStore.error() || 'Opslaan mislukt.';
    }
    this.cdr.markForCheck();
  }

  startEdit(entry: JournalEntry): void {
    this.editingId.set(entry.id);
    this.editEmotion.set(entry.emotion ?? null);
    this.editSliderValue.set(entry.sliderValue ?? 50);
    this.editFactors.set(entry.factors ? [...entry.factors] : []);
    this.editNoteValue = entry.content ?? '';
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async saveEdit(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    this.isUpdating.set(true);
    const result = await this.journalStore.updateEntry(id, {
      emotion: this.editEmotion() ?? undefined,
      sliderValue: this.editSliderValue(),
      factors: this.editFactors(),
      content: this.editNoteValue || undefined,
    });
    this.isUpdating.set(false);
    if (result) this.editingId.set(null);
  }

  toggleEditFactor(factor: string): void {
    const current = this.editFactors();
    this.editFactors.set(
      current.includes(factor) ? current.filter(f => f !== factor) : [...current, factor]
    );
  }

  selectEditEmotion(emotion: string): void {
    this.editEmotion.set(this.editEmotion() === emotion ? null : emotion);
  }

  async deleteEntry(id: string): Promise<void> {
    if (confirm('Weet je zeker dat je deze entry wilt verwijderen?')) {
      await this.journalStore.deleteEntry(id);
    }
  }

  getEmotionType(emotion: string | undefined): string {
    if (!emotion) return 'neutral';
    for (const cat of this.emotionCategories) {
      if (cat.emotions.includes(emotion)) return cat.type;
    }
    return 'neutral';
  }

  clearFilters(): void {
    this.filterEmotionCat.set(null);
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
  }

  hasActiveFilters(): boolean {
    return this.filterEmotionCat() !== null ||
      this.filterDateFrom() !== null ||
      this.filterDateTo() !== null;
  }
}
