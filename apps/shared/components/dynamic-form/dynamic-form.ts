import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormControlComponent } from '../form-controls/form-control';
import { DynamicFormField } from './dynamic-form.types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule,TranslatePipe],
  templateUrl: './dynamic-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements AfterViewInit, OnChanges {
  @Input() fields: DynamicFormField[] = [];
  @Input() initialValue: Record<string, unknown> = {};
  @Input() submitLabel = 'Save';
  @Input() isSubmitting = false;
  @Output() submitted = new EventEmitter<Record<string, unknown>>();

  readonly form = new FormGroup<Record<string, AbstractControl>>({});
  @ViewChild('fieldHost', { read: ViewContainerRef, static: true })
  private fieldHost!: ViewContainerRef;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.renderFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes['fields'] || changes['initialValue'])) {
      this.renderFields();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  private renderFields(): void {
    this.fieldHost.clear();
    Object.keys(this.form.controls).forEach((name) => this.form.removeControl(name));

    for (const field of this.fields) {
      const control = new FormControl<unknown>(
        this.initialValue[field.name] ?? '',
        field.validators ?? [],
      );
      this.form.addControl(field.name, control);

      const componentRef = this.fieldHost.createComponent(FormControlComponent);
      const component = componentRef.instance;
      component.type = field.type;
      component.label = field.label;
      component.placeholder = field.placeholder ?? '';
      component.required = field.required ?? false;
      component.readonly = field.readonly ?? false;
      component.boundControl = control;
      component.registerOnChange((value: unknown) => {
        control.setValue(value);
        control.markAsDirty();
      });
      component.registerOnTouched(() => control.markAsTouched());
      component.writeValue(control.value);
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}
