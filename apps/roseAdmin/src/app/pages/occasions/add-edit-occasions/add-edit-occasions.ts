import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { finalize, switchMap, take } from 'rxjs';
import { DynamicFormComponent, DynamicFormField } from '@org/dynamic-form';
import { OccasionsService } from '../service/occasions.service';
import { OccasionPayload } from '../models/occasion.models';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { resolveAuthErrorMessage } from '@org/auth';

@Component({
  selector: 'app-add-edit-occasions',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, TranslatePipe],
  templateUrl: './add-edit-occasions.html',
  styleUrl: './add-edit-occasions.css',
})
export class AddEditOccasionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly occasionsService = inject(OccasionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly toastr = inject(ToastrService);

  fields: DynamicFormField[] = [];

  title = 'Add New Occasion';
  submitLabel = 'Add Occasion';
  initialValue: Record<string, unknown> = {};
  occasionId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor() {
    this.occasionId = this.route.snapshot.paramMap.get('id');
    this.fields = this.getFields();
    if (this.occasionId) {
      this.title = 'Edit Occasion';
      this.submitLabel = 'Update Occasion';
      this.loadOccasion(this.occasionId);
    }
  }


submit(payload: Record<string, unknown>): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    const selectedImage = payload['image'];
    const occasionPayload: OccasionPayload = {
      title: String(payload['title'] ?? ''),
      description: String(payload['description'] ?? ''),
    };
    const request$ = this.occasionId
      ? selectedImage instanceof File
        ? this.occasionsService.uploadImage(selectedImage).pipe(
          switchMap(({ url }) =>
            this.occasionsService.update(this.occasionId!, { ...occasionPayload, image: url }),
          ),
        )
        : this.occasionsService.update(this.occasionId, occasionPayload)
      : selectedImage instanceof File
        ? this.occasionsService.uploadImage(selectedImage).pipe(
          switchMap(({ url }) =>
            this.occasionsService.create({ ...occasionPayload, image: url }),
          ),
        )
        : this.occasionsService.create(occasionPayload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastr.success(
          this.occasionId
            ? 'Occasion updated successfully.'
            : 'Occasion created successfully.',
        );
        this.router.navigate(['/admin/occasions']);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        if (this.isPayloadTooLargeError(error)) {
          const message = 'Image is too large. Please choose a smaller image.';
          this.toastr.error(message);
          this.errorMessage = message;
          this.changeDetector.detectChanges();
          return;
        }

        this.errorMessage = resolveAuthErrorMessage(
          error,
          'Could not save the occasion. Please try again.',
        );
        this.changeDetector.detectChanges();
      },
    });
  }

  private isPayloadTooLargeError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 413;
    }

    return typeof error === 'object' && error !== null && 'status' in error && error.status === 413;
  }

  private handleSuccess(): void {
    this.isSubmitting = false;
    this.toastr.success(
      this.occasionId
        ? 'Occasion updated successfully.'
        : 'Occasion created successfully.',
    );
    this.router.navigate(['/admin/occasions']);
  }

  private handleError(error: unknown): void {
    this.isSubmitting = false;
    this.errorMessage = resolveAuthErrorMessage(
      error,
      'Could not save the occasion. Please try again.',
    );
    this.changeDetector.detectChanges();
  }

  private loadOccasion(id: string): void {
    this.isLoading = true;
    this.occasionsService
      .getById(id)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (occasion) => {
          this.initialValue = {
            title: occasion.title,
            description: occasion.description,
          };
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          this.errorMessage = resolveAuthErrorMessage(error, 'Could not load the occasion.');
          this.changeDetector.detectChanges();
        },
      });
  }

  private getFields(): DynamicFormField[] {
    const fields: DynamicFormField[] = [
      {
        name: 'title',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter occasion name',
        required: true,
        validators: [Validators.required, Validators.maxLength(120)],
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter occasion description',
        required: false,
        validators: [ Validators.maxLength(500)],
      },
    ];

    fields.push({
      name: 'image',
      type: 'file',
      label: 'Image',
      placeholder: 'image/*',
      required: this.occasionId === null,
      validators: this.occasionId === null ? [Validators.required] : [],
    });

    return fields;
  }
}
