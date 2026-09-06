import { HttpParams } from '@angular/common/http';
import { FilterParams } from '../models/filter.model';

export function toHttpParams(filter?: FilterParams): HttpParams {
    let params = new HttpParams();
    if (!filter) return params;

    Object.entries(filter).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            (typeof value !== 'number' || !isNaN(value))
        ) {
            // HttpParams.set() returns a NEW instance - it does not mutate
            // `params` in place. Must reassign, or every param is silently lost.
            params = params.set(key, value.toString());
        }
    });
    return params;
}
