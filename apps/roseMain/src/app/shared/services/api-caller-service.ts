import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'auth/src/lib/auth/models';
import { environment } from 'apps/roseMain/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class APICallerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private createWebApiUrl(url: string): string {
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

  private unwrapPayload<T>(res: ApiResponse<T>): T {
    if (res.payload === undefined) {
      throw new Error('API returned no payload.');
    }
    return res.payload;
  }

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.createWebApiUrl(url), { params })
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  post<T>(url: string, body: unknown, params?: HttpParams): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.createWebApiUrl(url), body, { params })
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(this.createWebApiUrl(url), body)
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.createWebApiUrl(url), body)
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  /** Deletes may return message-only responses without a payload. */
  delete<T = unknown>(url: string): Observable<T> {
    return this.http.delete<T>(this.createWebApiUrl(url));
  }

  postWithAttachment(url: string, formData: FormData): Observable<unknown> {
    return this.http.post(this.createWebApiUrl(url), formData);
  }

  putWithAttachment(url: string, formData: FormData): Observable<unknown> {
    return this.http.put(this.createWebApiUrl(url), formData);
  }
}
