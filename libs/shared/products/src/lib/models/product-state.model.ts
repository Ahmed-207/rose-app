import { FilterParams } from './filter.model';
import { Product } from './product.model'; // ADDED: Import Product type

export interface ProductsState {
    isLoading: boolean;
    error: string | null;
    totalResults: number;
    filters: FilterParams;
    // ADDED: Sub-state to hold best-selling products separately from the main catalog
    bestProducts: Product[];
    isBestLoading: boolean;
    hasLoaded: boolean;
    searchResults: Product[];
    isSearchLoading: boolean;
    searchQuery: string;
}

export interface LookupState {
    isLoading: boolean;
    error: string | null;
    loaded: boolean;
}
