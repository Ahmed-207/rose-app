import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControlComponent } from '@org/shared-ui-components';
import { DynamicFormField } from './dynamic-form.types';
import { TranslatePipe } from '@ngx-translate/core';

interface FieldInstance {
  field: DynamicFormField;
  control: FormControl<unknown>;
  componentRef: ComponentRef<FormControlComponent>;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './dynamic-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements AfterViewInit, OnChanges {
  @Input() fields: DynamicFormField[] = [];
  @Input() initialValue: Record<string, unknown> = {};
  @Input() submitLabel = 'Save';
  @Input() isSubmitting = false;
  @Input() showSubmitButton = true;
  @Output() submitted = new EventEmitter<Record<string, unknown>>();
  @Output() valueChange = new EventEmitter<Record<string, unknown>>();

  readonly form = new FormGroup<Record<string, AbstractControl>>({});
  @ViewChild('fieldHost', { read: ViewContainerRef, static: false })
  private fieldHost: ViewContainerRef | null = null;
  private initialized = false;
  private fieldInstances: FieldInstance[] = [];

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.updateConditionalVisibility();
      this.valueChange.emit(this.form.getRawValue());
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.renderFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes['fields'] || changes['initialValue'])) {
      this.renderFields();
    }
  }

  submit(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    this.submitted.emit(this.form.getRawValue());
    return true;
  }

  private renderFields(): void {
    if (!this.fieldHost) return;

    this.fieldHost.clear();
    Object.keys(this.form.controls).forEach((name) => this.form.removeControl(name));
    this.fieldInstances = [];

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
      component.options = field.options ?? [];
      component.optionLabel = field.optionLabel ?? 'name';
      component.optionValue = field.optionValue ?? 'id';
      component.boundControl = control;
      component.registerOnChange((value: unknown) => {
        control.setValue(value);
        control.markAsDirty();
      });
      component.registerOnTouched(() => control.markAsTouched());
      component.writeValue(control.value);
      componentRef.changeDetectorRef.detectChanges();

      this.fieldInstances.push({ field, control, componentRef });
    }

    this.updateConditionalVisibility();
  }

  private updateConditionalVisibility(): void {
    const values = this.form.getRawValue();

    for (const { field, control, componentRef } of this.fieldInstances) {
      const isVisible = field.visibleWhen ? field.visibleWhen(values) : true;
      const element = componentRef.location.nativeElement as HTMLElement;

      if (isVisible) {
        element.style.display = '';
        control.enable({ emitEvent: false });
      } else {
        element.style.display = 'none';
        control.disable({ emitEvent: false });
      }
    }
  }
}
