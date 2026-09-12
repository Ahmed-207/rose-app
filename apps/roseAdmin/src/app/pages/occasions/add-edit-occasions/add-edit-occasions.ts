import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
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
    this.fields = this.getFields(this.occasionId === null);
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
      ...(selectedImage instanceof File ? { image: selectedImage.name } : {}),
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
      },
    });
  }

  private loadOccasion(id: string): void {
    this.isLoading = true;
    this.occasionsService
      .getById(id)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (occasion) => {
          this.initialValue = {
            title: occasion.title,
            description: occasion.description,
          };
          // this.isLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.errorMessage = resolveAuthErrorMessage(error, 'Could not load the occasion.');
          this.changeDetector.detectChanges();
        },
      });
  }

  private getFields(includeImage: boolean): DynamicFormField[] {
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
        required: true,
        validators: [Validators.required, Validators.maxLength(500)],
      },
    ];

    if (includeImage) {
      fields.push({
        name: 'image',
        type: 'file',
        label: 'Image',
        placeholder: 'image/*',
        required: true,
        validators: [Validators.required],
      });
    }

    return fields;
  }
}