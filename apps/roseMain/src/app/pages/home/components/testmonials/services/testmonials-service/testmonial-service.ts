import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestmonialService {

  private readonly apiUrl: string = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getTestmonials(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}testimonials?page=1&limit=3`);
  }

}
