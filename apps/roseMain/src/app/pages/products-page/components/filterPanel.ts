import { Component, computed, EventEmitter, inject, Output, output } from '@angular/core';
import { FilterParams } from '../model/FilterDto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OccasionsService } from '../services/occations-service';
import { CategoryService } from '../services/category-service';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Category, CategoryResponseDto } from '../model/categoryDto';
import { Occasion, OccasionResponseDto } from '../model/occationsDto';
import { RatingModule } from 'primeng/rating';
@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule,FormsModule,TranslatePipe,RatingModule],
  templateUrl: './filterPanel.html',
  styleUrl: './filterPanel.css',
})
export class FilterPanelComponent {
   private readonly occasionService = inject(OccasionsService);
  private readonly categoryService = inject(CategoryService);

  @Output() filterEvent = new EventEmitter<FilterParams>();

  private readonly categoriesResponse = toSignal<CategoryResponseDto | null>(
  this.categoryService.getCategories({ page: 1, limit: 100 }),
  {
    initialValue: null,
  }
);

private readonly occasionsResponse = toSignal<OccasionResponseDto | null>(
  this.occasionService.getOccasions({ page: 1, limit: 100 }),
  {
    initialValue: null,
  }
);
  readonly categories = computed<Category[]>(() => this.categoriesResponse()?.data ?? []);
  readonly occasions = computed<Occasion[]>(() => this.occasionsResponse()?.data ?? []);

  readonly priceLimits = { min: 0, max: 1000000 };

  selectedCategory: string | null = null;
  selectedOccasion: string | null = null;
  rating = 0;
  priceFrom: number | null = null;
  priceTo: number | null = null;

  get hasAnyFilter(): boolean {
    return (
      this.selectedCategory !== null ||
      this.selectedOccasion !== null ||
      this.rating > 0 ||
      this.priceFrom !== null ||
      this.priceTo !== null
    );
  }

  selectCategory(id: string): void {

    this.selectedCategory = this.selectedCategory === id ? null : id;
  }

  selectOccasion(id: string): void {
    this.selectedOccasion = this.selectedOccasion === id ? null : id;
  }

  setRating(value: number): void {

    this.rating = this.rating === value ? 0 : value;
  }

  resetCategories(): void {
    this.selectedCategory = null;
  }

  resetOccasions(): void {
    this.selectedOccasion = null;
  }

  resetRating(): void {
    this.rating = 0;
  }

  resetPrice(): void {
    this.priceFrom = null;
    this.priceTo = null;
  }

  resetAll(): void {
    this.resetCategories();
    this.resetOccasions();
    this.resetRating();
    this.resetPrice();
    this.applyFilters();
  }

  applyFilters(): void {
    const payload: FilterParams = {};
    if (this.selectedCategory) payload.categoryId = this.selectedCategory;
    if (this.selectedOccasion) payload.occasionId = this.selectedOccasion;
    if (this.rating) payload.minRating = this.rating;
    if (this.priceFrom !== null) payload.minPrice = this.priceFrom;
    if (this.priceTo !== null) payload.maxPrice = this.priceTo;

    this.filterEvent.emit(payload);
  }
}
