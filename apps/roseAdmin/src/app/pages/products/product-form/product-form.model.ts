export interface ProductFormValue {
    title: string;
    description: string;
    price: number | null;
    stock: number | null;
    cover: string;
    gallery: string[];
    categoryId: string;
    occasionIds: string[];
    discountType?: string;
    discountValue?: number | null;
    subCategoryId?: string;
}
