import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {

  totalSteps = input.required<number>();
  activeStep = input.required<number>();

  stepChange = output<number>();

  readonly stepNumbers = computed(() =>
    Array.from({ length: this.totalSteps() }, (_, i) => i + 1)
  );

  readonly progressPercent = computed(() => {
    const total = this.totalSteps();
    if (total <= 1) return 100;
    return ((this.activeStep() - 1) / (total - 1)) * 100;
  });

  onStepClick(step: number): void {
    this.stepChange.emit(step);
  }
}