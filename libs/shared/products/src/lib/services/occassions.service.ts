import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APICallerService } from '../utilities/api-caller-service';
import { OCCASION } from '../utilities/api-endpoints';
import { OccasionResponseDto } from '../models/occassion.model'

const EMPTY_OCCASIONS_RES: OccasionResponseDto = {
    data: [],
    metadata: { page: 1, limit: 0, total: 0, totalPages: 0 },
};

@Injectable({
    providedIn: 'root',
})
export class OccasionsService {
    private readonly _httpCaller = inject(APICallerService);

    getOccasions(): Observable<OccasionResponseDto> {
        return this._httpCaller.get<OccasionResponseDto>(OCCASION.getOccasions).pipe(
            map(data => data ?? EMPTY_OCCASIONS_RES),
            catchError(err => {
                console.error('Failed to load occasions', err);
                return throwError(() => err);
            }),
        );
    }
}