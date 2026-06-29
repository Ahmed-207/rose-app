import { Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Button } from 'apps/shared/components/button/button';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { ProductDetail, ProductReview } from 'apps/shared/models/productDetailDto';

@Component({
  selector: 'product-reviews',
  imports: [
    TranslatePipe,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    FormControlComponent,
  ],
  templateUrl: './productReviews.html',
  styleUrl: './productReviews.css',
})
export class ProductReviews {
  readonly product = input.required<ProductDetail>();
  readonly reviewAdded = output<ProductReview>();

  private readonly addedReviews = signal<ProductReview[]>([]);

  readonly reviews = computed(() => [
    ...this.addedReviews(),
    ...this.product().reviews,
  ]);

  readonly formRating = signal(0);

  readonly reviewForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submitReview(): void {
    if (this.formRating() === 0) {
      return;
    }

    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) return;

    const newReview: ProductReview = {
      id: Date.now(),
      author: 'You',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rating: this.formRating(),
      title: this.reviewForm.controls.title.value,
      content: this.reviewForm.controls.content.value,
    };

    this.addedReviews.update((items) => [newReview, ...items]);
    this.reviewAdded.emit(newReview);
    this.reviewForm.reset();
    this.formRating.set(0);
  }
}
