import { Metadata } from './metadata.model';

export interface SubCategory {
    id: string;
    title: string;
}

export interface Category {
    id: string;
    title: string;
    description: string;
    image: string;
    immutable: boolean;
    createdAt: string;
    updatedAt: string;
    subCategories: SubCategory[];
    _count: { products: number };
}

export interface CategoryResponseDto {
    data: Category[];
    metadata: Metadata;
}