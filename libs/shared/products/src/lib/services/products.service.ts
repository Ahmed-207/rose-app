import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APICallerService } from '../utilities/api-caller-service';
import { PRODUCT, REVIEW } from '../utilities/api-endpoints';
import { FilterParams } from '../models/filter.model';
import {
    ProductsRes,
    SingleProductRes,
    ReviewsRes,
    CreateReviewReq,
    CreateReviewRes,
} from '../models/product.model';

function toHttpParams(filter?: FilterParams): HttpParams {
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

const EMPTY_PRODUCTS_RES: ProductsRes = {
    data: [],
    metadata: { page: 1, limit: 0, total: 0, totalPages: 0 },
};

const EMPTY_REVIEWS_RES: ReviewsRes = {
    data: [],
    metadata: { page: 1, limit: 0, total: 0, totalPages: 0 },
};

@Injectable({
    providedIn: 'root',
})
export class ProductsService {
    private readonly _httpCaller = inject(APICallerService);

    getAllProducts(filter: FilterParams): Observable<ProductsRes> {
        return this._httpCaller.get<ProductsRes>(PRODUCT.getProducts, toHttpParams(filter)).pipe(
            map(data => data ?? EMPTY_PRODUCTS_RES),
            catchError(err => {
                console.error('Failed to load products', err);
                return throwError(() => err);
            }),
        );
    }

    getProductById(id: string): Observable<SingleProductRes> {
        return this._httpCaller.get<SingleProductRes>(`${PRODUCT.getProducts}/${id}`).pipe(
            catchError(err => {
                console.error('Failed to load product', err);
                return throwError(() => err);
            }),
        );
    }

    // Used by RelatedProductsSection: a bounded, stateless fetch that never
    // touches ProductsStore, so it can't clobber the products-page's filtered
    // list (they share the same singleton store otherwise).
    getRelatedProducts(currentProductId: string, limit = 8): Observable<ProductsRes> {
        return this.getAllProducts({ page: 1, limit, excludeProductId: currentProductId });
    }

    getProductReviews(productId: string, page = 1, limit = 20): Observable<ReviewsRes> {
        const params = toHttpParams({ page, limit }).set('productId', productId);

        return this._httpCaller.get<ReviewsRes>(REVIEW.getReviews, params).pipe(
            map(data => data ?? EMPTY_REVIEWS_RES),
            catchError(err => {
                console.error('Failed to load reviews', err);
                return throwError(() => err);
            }),
        );
    }

    createProductReview(review: CreateReviewReq, token: string): Observable<CreateReviewRes> {
        const params = new HttpParams().set('token', token);

        return this._httpCaller.post<CreateReviewRes>(REVIEW.createReview, review, params).pipe(
            catchError(err => {
                console.error('Failed to create review', err);
                return throwError(() => err);
            }),
        );
    }
}