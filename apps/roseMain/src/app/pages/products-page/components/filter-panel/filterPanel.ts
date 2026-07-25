import { Component, computed, EventEmitter, effect, inject, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RatingModule } from 'primeng/rating';
import { FilterParams, CategoriesStore, OccasionsStore } from '@org/products';

@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule, FormsModule, TranslatePipe, RatingModule],
  templateUrl: './filterPanel.html',
  styleUrl: './filterPanel.css',
})
export class FilterPanelComponent {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly occasionsStore = inject(OccasionsStore);

  @Output() filterEvent = new EventEmitter<FilterParams>();

  /**
   * Bump this input (any changed number, e.g. a counter incremented by the
   * parent) to tell the panel to clear its own local selection state. The
   * panel owns selectedCategory/selectedOccasion/rating/price internally,
   * so the parent can't reach in and reset them directly — this is the
   * one-way signal that does it instead.
   */
  readonly resetSignal = input<number>(0);

  readonly categories = computed(() => this.categoriesStore.entities());
  readonly occasions = computed(() => this.occasionsStore.entities());

  readonly priceLimits = { min: 0, max: 1000000 };

  selectedCategory: string | null = null;
  selectedOccasion: string | null = null;
  rating = 0;
  priceFrom: number | null = null;
  priceTo: number | null = null;

  private isFirstResetSignal = true;

  constructor() {
    this.categoriesStore.loadOnce();
    this.occasionsStore.loadOnce();

    effect(() => {
      this.resetSignal();

      // Skip the initial run — input()'s effect fires once on init with
      // the default value, and we don't want that to "reset" an already-
      // empty panel or emit anything before the user has done anything.
      if (this.isFirstResetSignal) {
        this.isFirstResetSignal = false;
        return;
      }

      this.selectedCategory = null;
      this.selectedOccasion = null;
      this.rating = 0;
      this.priceFrom = null;
      this.priceTo = null;
    });
  }

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