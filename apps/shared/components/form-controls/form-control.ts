import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  Optional,
  Self,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
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
import { TranslatePipe } from '@ngx-translate/core';
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
  selector: 'app-form-control',
  standalone: true,
  templateUrl: './form-control.html',
  imports:[FormsModule,PasswordModule,InputTextModule,SelectModule,CheckboxModule,ToggleSwitchModule,MultiSelectModule,TextareaModule,InputNumberModule,DatePickerModule,TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class FormControlComponent
  implements ControlValueAccessor, AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() groupError = '';

  @Input() type: FormControlType = 'text';

  @Input() label = '';

  @Input() placeholder = '';

  @Input() options: any[] = [];

  @Input() optionLabel = 'label';

  @Input() optionValue = 'value';

  @Input() readonly = false;

  @Input() required = false;

  @Input() boundControl: FormControl | null = null;

  value: any = null;

  disabled = false;

  constructor(@Optional() @Self() public ngControl: NgControl) {
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

  private onChange = (_: any) => {};

  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  update(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  fileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.update(input.files?.[0] ?? null);
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
    if (this.groupError)        return this.groupError; // ← group-level fallback
    return 'Incorrect value';
  }
}
