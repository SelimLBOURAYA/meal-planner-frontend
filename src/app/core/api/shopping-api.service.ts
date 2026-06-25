import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type ShoppingExportFormat = 'pdf' | 'csv' | 'text';

@Injectable({ providedIn: 'root' })
export class ShoppingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/shopping`;

  getChecked(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/checked`);
  }

  putChecked(ids: string[]): Observable<void> {
    return this.http.put<void>(`${this.base}/checked`, ids);
  }

  exportShopping(
    from: string,
    to: string,
    format: ShoppingExportFormat,
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('format', format);

    return this.http.get(`${this.base}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
