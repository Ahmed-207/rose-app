import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef
} from '@angular/core';

import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
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
  | 'date';

@Component({
  selector: 'app-form-control',
  standalone: true,
  templateUrl: './form-control.html',
  imports:[FormsModule,PasswordModule,InputTextModule,SelectModule,CheckboxModule,ToggleSwitchModule,MultiSelectModule,TextareaModule,InputNumberModule,DatePickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlComponent),
      multi: true
    }
  ]
})
export class FormControlComponent
  implements ControlValueAccessor {

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

  private onChange = (_: any) => {};

  private onTouched = () => {};

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
}
