export interface ProductFormValue {
    title: string;
    description: string;
    price: number | null;
    stock: number | null;
    discountType: string;
    discountValue: number | null;
    cover: string;
    gallery: string[];
    categoryId: string;
    subCategoryId: string;
    occasionIds: string[];
}
