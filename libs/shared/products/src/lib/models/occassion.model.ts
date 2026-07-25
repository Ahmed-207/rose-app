import { Metadata } from './metadata.model';

export interface Occasion {
    id: string;
    title: string;
    description: string;
    image: string;
    immutable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OccasionResponseDto {
    data: Occasion[];
    metadata: Metadata;
}