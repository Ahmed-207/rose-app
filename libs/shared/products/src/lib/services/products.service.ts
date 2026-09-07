import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APICallerService } from '../utilities/api-caller-service';
import { PRODUCT, REVIEW, UPLOAD } from '../utilities/api-endpoints';
import { toHttpParams } from '../utilities/http-params';
import { FilterParams } from '../models/filter.model';
import {
    ProductsRes,
    SingleProductRes,
    ReviewsRes,
    CreateReviewReq,
    CreateReviewRes,
    CreateProductReq,
    UpdateProductReq,
    CreateProductRes,
    UpdateProductRes,
    UploadImageRes,
} from '../models/product.model';

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

    getRelatedProducts(currentProductId: string, limit = 8): Observable<ProductsRes> {
        const fetchLimit = limit + 1;

        return this.getAllProducts({ page: 1, limit: fetchLimit }).pipe(
            map((res) => {
                const filtered = res.data.filter((p) => p.id !== currentProductId).slice(0, limit);
                return { ...res, data: filtered };
            }),
        );
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

    createProduct(product: CreateProductReq): Observable<CreateProductRes> {
        return this._httpCaller.post<CreateProductRes>(PRODUCT.getProducts, product).pipe(
            catchError(err => {
                console.error('Failed to create product', err);
                return throwError(() => err);
            }),
        );
    }

    updateProduct(id: string, product: UpdateProductReq): Observable<UpdateProductRes> {
        return this._httpCaller.patch<UpdateProductRes>(`${PRODUCT.getProducts}/${id}`, product).pipe(
            catchError(err => {
                console.error('Failed to update product', err);
                return throwError(() => err);
            }),
        );
    }

    deleteProduct(id: string): Observable<unknown> {
        return this._httpCaller.delete<unknown>(`${PRODUCT.getProducts}/${id}`).pipe(
            catchError(err => {
                console.error('Failed to delete product', err);
                return throwError(() => err);
            }),
        );
    }

    uploadImage(file: File): Observable<UploadImageRes> {
        const formData = new FormData();
        formData.append('image', file);

        return this._httpCaller.post<UploadImageRes>(UPLOAD.uploadImage, formData).pipe(
            catchError(err => {
                console.error('Failed to upload image', err);
                return throwError(() => err);
            }),
        );
    }
}