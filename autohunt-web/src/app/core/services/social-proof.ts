import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface SocialProofData {
  vehicleId: number;
  recentViewsCount: number;
  recentBookingsCount: number;
}

@Injectable({ providedIn: 'root' })
export class SocialProofService {
  private http = inject(HttpClient);
  private apiUrl = '/api/vehicles';

  getSocialProof(vehicleId: number): Observable<SocialProofData> {
    return this.http.get<SocialProofData>(`${this.apiUrl}/${vehicleId}/social-proof`).pipe(
      catchError(() => of({ vehicleId, recentViewsCount: 0, recentBookingsCount: 0 }))
    );
  }

  recordView(vehicleId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${vehicleId}/view`, {}).pipe(
      catchError(() => of(undefined))
    );
  }
}
