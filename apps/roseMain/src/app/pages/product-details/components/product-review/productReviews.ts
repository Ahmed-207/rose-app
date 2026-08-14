import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthCookieStorage } from '@org/auth';
import { ProductsService } from '@org/products';
import { AppToastService } from '@org/shared-ui-components';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'apps/shared/components/button/button';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { ProductDetail, ProductReview } from 'apps/shared/models/productDetailDto';
import { mapApiReviewToProductReview } from '../../../../shared/utils/map-api-product';

@Component({
  selector: 'product-reviews',
  imports: [
    TranslatePipe,
    DecimalPipe,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    FormControlComponent,
  ],
  templateUrl: './productReviews.html',
  styleUrl: './productReviews.css',
})
export class ProductReviews implements AfterViewInit, OnDestroy {
  @ViewChild('reviewFormElement') private reviewFormElement?: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authCookieStorage = inject(AuthCookieStorage);
  private readonly router = inject(Router);
  private readonly toast = inject(AppToastService);

  readonly product = input.required<ProductDetail>();
  readonly reviewAdded = output<ProductReview>();

  private formResizeObserver?: ResizeObserver;

  readonly reviews = computed(() => this.product().reviews);

  readonly formRating = signal(0);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly showSignInPrompt = signal(false);
  readonly reviewListMaxHeight = signal<number | null>(null);

  readonly reviewForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.reviewFormElement) {
      return;
    }

    const formElement = this.reviewFormElement.nativeElement;
    const syncFormHeight = () => {
      this.reviewListMaxHeight.set(formElement.offsetHeight);
    };

    syncFormHeight();
    this.formResizeObserver = new ResizeObserver(syncFormHeight);
    this.formResizeObserver.observe(formElement);
  }

  ngOnDestroy(): void {
    this.formResizeObserver?.disconnect();
  }

  submitReview(): void {
    this.submitError.set('');
    this.showSignInPrompt.set(false);

    const session = this.authCookieStorage.getSession();

    if (!session?.token) {
      this.showSignInFirst();
      return;
    }

    if (this.formRating() === 0 || this.isSubmitting()) {
      return;
    }

    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) return;

    const review = {
      productId: String(this.product().id),
      headline: this.reviewForm.controls.title.value,
      content: this.reviewForm.controls.content.value,
      rating: this.formRating(),
    };

    this.isSubmitting.set(true);
    this.productsService.createProductReview(review, session.token)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const apiReview = response.review;
          const createdReview = apiReview
            ? mapApiReviewToProductReview(apiReview)
            : this.mapSubmittedReview(review);

          this.reviewAdded.emit(createdReview);
          this.reviewForm.reset();
          this.toast.success('toast.REVIEW_ADDED');
          this.formRating.set(0);
          this.showSignInPrompt.set(false);
        },
        error: (error: unknown) => {
          if (this.isAuthError(error)) {
            this.showSignInFirst();
            return;
          }
        },
      });
  }

  goToSignIn(): void {
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  private showSignInFirst(): void {
    this.submitError.set('Please sign in first to add a review');
    this.showSignInPrompt.set(true);
  }

  private isAuthError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return true;
      }

      const message = String(error.error?.message ?? error.error?.error ?? '').toLowerCase();
      return error.status === 400 && /auth|jwt|login|token|unauthorized/.test(message);
    }

    return false;
  }

  private mapSubmittedReview(review: {
    headline: string;
    content: string;
    rating: number;
  }): ProductReview {
    return {
      id: crypto.randomUUID(),
      author: 'You',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rating: review.rating,
      title: review.headline,
      content: review.content,
    };
  }
}