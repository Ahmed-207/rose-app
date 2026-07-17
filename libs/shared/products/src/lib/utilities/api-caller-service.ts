import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'auth/src/lib/auth/models';
import { environment } from 'apps/roseMain/src/environments/environment';


@Injectable({
    providedIn: 'root',
})
export class APICallerService {
    protected _http: HttpClient;
    private apiUrl = environment.apiUrl;

    constructor(
        _http: HttpClient,

        @Inject(PLATFORM_ID) private readonly platformId: object,
    ) {
        this._http = _http;
    }



    private createWebApiUrl(url: string) {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;
        const normalizedUrl = url.trim();

        if (normalizedUrl.startsWith('/api/') || normalizedUrl.startsWith('api/')) {
            return new URL(
                normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`,
                baseUrl,
            ).toString();
        }

        return baseUrl + normalizedUrl.replace(/^\/+/, '');
    }
    public get<T>(url: string, params?: HttpParams): Observable<T> {
        return this._http
            .get<ApiResponse<T>>(this.createWebApiUrl(url), { params })
            .pipe(map(res => {
                if (res.payload === undefined) {
                    throw new Error('API returned no payload.');
                }
                return res.payload;
            }));
    }



    post<T>(url: string, body: unknown, params?: HttpParams): Observable<T> {
        return this._http
            .post<ApiResponse<T>>(this.createWebApiUrl(url), body, { params })
            .pipe(map(res => {
                if (res.payload === undefined) {
                    throw new Error('API returned no payload.');
                }
                return res.payload;
            }));
    }

    public put(url: string, body: unknown) {

        return this._http.put(this.createWebApiUrl(url), body);
    }

    public delete(url: string) {

        return this._http.delete(this.createWebApiUrl(url));
    }

    public postWithAttachment(url: string, formData: any) {

        return this._http.post(this.createWebApiUrl(url), formData);
    }

    public puttWithAttachment(url: string, formData: any) {

        return this._http.put(this.createWebApiUrl(url), formData);
    }
}
