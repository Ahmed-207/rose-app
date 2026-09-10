import { TranslatePipe } from '@ngx-translate/core';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl
} from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

export type FormControlType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'file';

@Component({
  selector: 'lib-form-control',
  standalone: true,
  templateUrl: './form-control.html',
  styleUrl: './form-control.css',
  imports: [FormsModule, PasswordModule, InputTextModule, SelectModule, CheckboxModule, ToggleSwitchModule, MultiSelectModule, TextareaModule, InputNumberModule, DatePickerModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlComponent implements ControlValueAccessor, AfterViewInit {
  private static idCounter = 0;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly controlId = `lib-fc-${FormControlComponent.idCounter++}`;

  @Input() groupError = '';

  @Input() type: FormControlType = 'text';

  @Input() label = '';

  @Input() placeholder = '';

  @Input() options: unknown[] = [];

  @Input() optionLabel = 'name';

  @Input() optionValue = 'id';

  @Input() readonly = false;

  @Input() required = false;

  @Input() boundControl: FormControl | null = null;

  value: unknown = null;

  disabled = false;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    this.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  get control(): FormControl | null {
    return this.boundControl ?? (this.ngControl?.control as FormControl) ?? null;
  }

  private onChange: (value: unknown) => void = () => {
    // no-op: replaced by registerOnChange
  };

  private onTouched = () => {
    // no-op: replaced by registerOnTouched
  };

  writeValue(value: unknown): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  update(value: unknown): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  fileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.update(input.files?.[0] ?? null);
    this.cdr.markForCheck();
  }

  get fileName(): string {
    return this.value instanceof File ? this.value.name : '';
  }

  get hasError(): boolean {
    const controlInvalid = !!(
      this.control?.invalid &&
      (this.control.touched || this.control.dirty)
    );
    return controlInvalid || (!!this.groupError && (this.control?.touched || this.control?.dirty) === true);
  }

  get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength}`;
    if (this.groupError) return this.groupError;
    return 'Incorrect value';
  }
}
