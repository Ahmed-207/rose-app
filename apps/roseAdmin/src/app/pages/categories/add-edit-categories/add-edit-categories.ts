import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { DynamicFormComponent } from 'apps/shared/components/dynamic-form/dynamic-form';
import { DynamicFormField } from 'apps/shared/components/dynamic-form/dynamic-form.types';
import { CategoriesService } from '../service/categories.service';
import { CategoryPayload } from '../models/category.models';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-edit-categories',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, TranslatePipe],
  templateUrl: './add-edit-categories.html',
  styleUrl: './add-edit-categories.css',
})
export class AddEditCategoriesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly toastr = inject(ToastrService);

  fields: DynamicFormField[] = [];

  title = 'Add New Category';
  submitLabel = 'Add Category';
  initialValue: Record<string, unknown> = {};
  categoryId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.fields = this.getFields(this.categoryId === null);
    if (this.categoryId) {
      this.title = 'Edit Category';
      this.submitLabel = 'Update Category';
      this.loadCategory(this.categoryId);
    }
  }

  submit(payload: Record<string, unknown>): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    const selectedImage = payload['image'];
    const categoryPayload: CategoryPayload = {
      title: String(payload['title'] ?? ''),
      description: String(payload['description'] ?? ''),
      ...(selectedImage instanceof File ? { image: selectedImage.name } : {}),
    };
    const request$ = this.categoryId
      ? this.categoriesService.update(this.categoryId, categoryPayload)
      : this.categoriesService.create(categoryPayload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastr.success(
          this.categoryId
            ? 'Category updated successfully.'
            : 'Category created successfully.',
        );
        this.router.navigate(['/admin/categories']);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  private loadCategory(id: string): void {
    this.isLoading = true;
    this.categoriesService
      .getById(id)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (category) => {
          this.initialValue = {
            title: category.title,
            description: category.description,
          };
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error, 'Could not load the category.');
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
        placeholder: 'Enter category name',
        required: true,
        validators: [Validators.required, Validators.maxLength(120)],
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter category description',
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

  private getErrorMessage(
    error: unknown,
    fallback = 'Could not save the category. Please try again.',
  ): string {
    const response = error instanceof HttpErrorResponse ? error.error : error;
    if (!response || typeof response !== 'object') return fallback;

    const body = response as { message?: unknown; errors?: unknown };
    if (typeof body.message === 'string' && body.message) return body.message;
    if (Array.isArray(body.errors)) {
      const validationMessage = body.errors.find(
        (item): item is { message: string } =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as { message?: unknown }).message === 'string',
      )?.message;
      if (validationMessage) return validationMessage;
    }

    return fallback;
  }
}
