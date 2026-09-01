import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL, ApiResponse } from '@org/auth';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiCallerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

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

  get<T>(url: string, options?: { params?: HttpParams }): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.createWebApiUrl(url), options)
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.createWebApiUrl(url), body)
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.createWebApiUrl(url), body)
      .pipe(map((res) => this.unwrapPayload(res)));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.createWebApiUrl(url));
  }
}
