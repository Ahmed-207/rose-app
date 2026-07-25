import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@org/auth';
import { Observable } from 'rxjs';

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

  get<T>(url: string, options?: { params?: HttpParams; context?: HttpContext }): Observable<T> {
    return this.http.get<T>(this.createWebApiUrl(url), options);
  }

  post<T>(url: string, body: unknown, options?: { params?: HttpParams; context?: HttpContext }): Observable<T> {
    return this.http.post<T>(this.createWebApiUrl(url), body, options);
  }

  patch<T>(url: string, body: unknown, options?: { context?: HttpContext }): Observable<T> {
    return this.http.patch<T>(this.createWebApiUrl(url), body, options);
  }

  delete<T>(url: string, options?: { context?: HttpContext }): Observable<T> {
    return this.http.delete<T>(this.createWebApiUrl(url), options);
  }
}