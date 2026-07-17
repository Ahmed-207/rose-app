export interface FilterParams {
    page?: number;
    limit?: number;
    occasionId?: string;
    categoryId?: string;
    subCategoryId?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    excludeProductId?: string;
}