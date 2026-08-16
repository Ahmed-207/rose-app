import { TranslatePipe } from '@ngx-translate/core';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';

import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl
} from '@angular/forms';

const noop: () => void = () => undefined;
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
  | 'date';

@Component({
  selector: 'lib-form-control',
  standalone: true,
  templateUrl: './form-control.html',
  imports: [FormsModule, PasswordModule, InputTextModule, SelectModule, CheckboxModule, ToggleSwitchModule, MultiSelectModule, TextareaModule, InputNumberModule, DatePickerModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlComponent implements ControlValueAccessor {


  @Input() type: FormControlType = 'text';

  @Input() label = '';

  @Input() placeholder = '';

  @Input() options: any[] = [];

  @Input() optionLabel = 'name';

  @Input() optionValue = 'id';

  @Input() readonly = false;

  @Input() required = false;

  value: any = null;

  disabled = false;

  public ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    //  this component as the value accessor
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control(): FormControl | null {
    return this.ngControl?.control as FormControl ?? null;
  }

  get controlId(): string {
    return this.ngControl?.name ? String(this.ngControl.name) : 'form-control';
  }

  private onChange = noop as (_: any) => void;

  private onTouched = noop;

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  update(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
  get hasError(): boolean {
    return !!(
      this.control?.invalid &&
      (this.control.touched || this.control.dirty)
    );
  }

  get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength}`;
    return 'Incorrect value';
  }
}
