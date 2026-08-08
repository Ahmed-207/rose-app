import { Component, Input, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInput),
      multi: true,
    },
  ]
})
export class PasswordInput implements ControlValueAccessor {
  @Input() placeholder: string = '********';

  showPassword = signal(false);
  value = signal<string>('');
  disabled = signal(false);

  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  toggleVisibility(): void {
    if (!this.disabled()) {
      this.showPassword.update((v) => !v);
    }
  }

  onInput(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    this.value.set(inputVal);
    this.onChange(inputVal);
  }

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
