import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
    private http = inject(HttpClient);
    private apiUrl = '/api/favorites';

    toggleFavorite(vehicleId: number) {
        return this.http.post(`${this.apiUrl}/${vehicleId}`, {});
    }

    getMyFavorites() {
        return this.http.get<any[]>(`${this.apiUrl}/my`);
    }

    checkFavorite(vehicleId: number) {
        return this.http.get<any>(`${this.apiUrl}/check/${vehicleId}`);
    }
}
