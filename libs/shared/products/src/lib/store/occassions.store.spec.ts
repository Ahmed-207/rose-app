import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { OccasionsStore } from '../store/occassions.store';
import { OccasionsService } from '../services/occassions.service';
import { Occasion, OccasionResponseDto } from '../models/occassion.model';

const mockOccasion: Occasion = {
    id: 'occ-1',
    title: 'Birthday',
    description: 'Birthday flowers',
    image: 'birthday.jpg',
    immutable: false,
    createdAt: '',
    updatedAt: '',
};

const mockResponse: OccasionResponseDto = {
    data: [mockOccasion],
    metadata: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

const mockOccasionsService = {
    getOccasions: vi.fn(),
};

describe('OccasionsStore', () => {
    let store: InstanceType<typeof OccasionsStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OccasionsStore,
                { provide: OccasionsService, useValue: mockOccasionsService },
            ],
        });
        store = TestBed.inject(OccasionsStore);
        mockOccasionsService.getOccasions.mockReset();
    });

    it('should load occasions with pagination and search', () => {
        mockOccasionsService.getOccasions.mockReturnValue(of(mockResponse));

        store.loadOccasions({ page: 1, limit: 10, search: 'birthday' });

        expect(mockOccasionsService.getOccasions).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'birthday' });
        expect(store.entities()).toEqual([mockOccasion]);
        expect(store.totalResults()).toBe(1);
        expect(store.loaded()).toBe(true);
        expect(store.isLoading()).toBe(false);
    });

    it('should apply filters and reset to page 1', () => {
        mockOccasionsService.getOccasions.mockReturnValue(of(mockResponse));

        patchState(store, { filters: { page: 2, limit: 25 } });
        store.applyFilters({ search: 'wedding' });

        expect(mockOccasionsService.getOccasions).toHaveBeenCalledWith({ page: 1, limit: 25, search: 'wedding' });
    });

    it('should keep loadOnce behavior for existing consumers', () => {
        mockOccasionsService.getOccasions.mockReturnValue(of(mockResponse));

        store.loadOnce();
        store.loadOnce();

        expect(mockOccasionsService.getOccasions).toHaveBeenCalledTimes(1);
        expect(store.loaded()).toBe(true);
    });

    it('should set error state on failure', () => {
        mockOccasionsService.getOccasions.mockReturnValue(throwError(() => ({ message: 'Server error' })));

        store.loadOccasions({ page: 1, limit: 10 });

        expect(store.error()).toBe('Server error');
        expect(store.isLoading()).toBe(false);
        expect(store.loaded()).toBe(true);
    });
});
