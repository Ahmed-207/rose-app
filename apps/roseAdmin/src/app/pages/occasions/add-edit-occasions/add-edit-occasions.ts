import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { DynamicFormComponent, DynamicFormField } from '@org/dynamic-form';
import { OccasionsService } from '../service/occasions.service';
import { OccasionPayload } from '../models/occasion.models';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { resolveAuthErrorMessage } from '@org/auth';
import { Button, Spinner } from '@org/shared-ui-components';

@Component({
  selector: 'app-add-edit-occasions',
  standalone: true,
  imports: [CommonModule, RouterModule, DynamicFormComponent, TranslatePipe, Button, Spinner],
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
  imageUrl = '';
  readonly isUploadingImage = signal(false);
  readonly uploadError = signal<string | null>(null);

  readonly pageHeading = computed(() => {
    const title = String(this.initialValue['title'] ?? '');
    return this.occasionId && title ? `Update Occasion: ${title}` : this.title;
  });

  readonly breadcrumbLabel = computed(() => {
    const title = String(this.initialValue['title'] ?? '');
    if (!this.occasionId || !title) return this.title;
    const words = title.trim().split(/\s+/);
    return `Update Occasion: ${words.slice(0, 2).join(' ')}`;
  });

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

    if (!this.occasionId && !this.imageUrl) {
      this.isSubmitting = false;
      this.errorMessage = 'Image is required for new occasions.';
      this.changeDetector.detectChanges();
      return;
    }

    const occasionPayload: OccasionPayload = {
      title: String(payload['title'] ?? ''),
      description: String(payload['description'] ?? ''),
      ...(this.imageUrl ? { image: this.imageUrl } : {}),
    };

    const request$ = this.occasionId
      ? this.occasionsService.update(this.occasionId, occasionPayload)
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
        this.errorMessage = resolveAuthErrorMessage(
          error,
          'Could not save the occasion. Please try again.',
        );
        this.changeDetector.detectChanges();
      },
    });
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
          this.imageUrl = occasion.image ?? '';
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          this.errorMessage = resolveAuthErrorMessage(error, 'Could not load the occasion.');
          this.changeDetector.detectChanges();
        },
      });
  }

  private getFields(): DynamicFormField[] {
    return [
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
        required: true,
        validators: [Validators.required, Validators.maxLength(500)],
      },
    ];
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    if (!file) return;

    this.uploadImage(file);
  }

  removeImage(): void {
    this.imageUrl = '';
  }

  private uploadImage(file: File): void {
    this.isUploadingImage.set(true);
    this.uploadError.set(null);

    this.compressImage(file)
      .then((compressedFile) => {
        this.occasionsService
          .uploadImage(compressedFile)
          .pipe(take(1), finalize(() => this.isUploadingImage.set(false)))
          .subscribe({
            next: (res) => {
              this.imageUrl = res.url;
            },
            error: (err: unknown) => {
              this.uploadError.set(this.extractUploadError(err));
            },
          });
      })
      .catch((err: unknown) => {
        this.isUploadingImage.set(false);
        this.uploadError.set(this.extractUploadError(err));
      });
  }

  private extractUploadError(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const error = err as { error?: { message?: string }; message?: string };
      return error.error?.message || error.message || 'Could not upload image. Please try again.';
    }
    return 'Could not upload image. Please try again.';
  }

  private compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let width = image.width;
        let height = image.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(file);
          return;
        }
        context.drawImage(image, 0, 0, width, height);

        const outputType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressed = new File([blob], file.name, {
              type: outputType,
              lastModified: file.lastModified,
            });
            resolve(compressed.size < file.size ? compressed : file);
          },
          outputType,
          quality,
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for compression'));
      };

      image.src = objectUrl;
    });
  }
}