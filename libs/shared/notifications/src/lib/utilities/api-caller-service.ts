import { HttpClient, HttpParams } from '@angular/common/http';
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

  get<T>(url: string, options?: { params?: HttpParams }): Observable<T> {
    return this.http.get<T>(this.createWebApiUrl(url), options);
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.createWebApiUrl(url), body);
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.createWebApiUrl(url), body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.createWebApiUrl(url));
  }
}
