import { ValidatorFn } from '@angular/forms';
import { FormControlType } from '@org/shared-ui-components';

export interface DynamicFormField {
  name: string;
  type: FormControlType;
  label: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  validators?: ValidatorFn[];
}
