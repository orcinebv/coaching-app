import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-group" [ngClass]="{ 'has-error': error }">
      <label *ngIf="label" [for]="inputId" class="input-label">{{ label }}</label>
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [value]="value"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
        class="input-field"
      />
      <span *ngIf="error" class="input-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text, #374151);
    }

    .input-field {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-field:focus {
      border-color: var(--primary, #6366f1);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .input-field:disabled {
      background-color: var(--disabled-bg, #f3f4f6);
      cursor: not-allowed;
    }

    .has-error .input-field {
      border-color: var(--danger, #ef4444);
    }

    .input-error {
      font-size: 0.75rem;
      color: var(--danger, #ef4444);
    }
  `],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() inputId = 'input-' + Math.random().toString(36).slice(2, 9);

  value = '';
  isDisabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }
}
