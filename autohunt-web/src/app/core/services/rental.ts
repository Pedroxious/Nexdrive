import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RentalService {
    private http = inject(HttpClient);
    private apiUrl = '/api/rentals';

    createRental(data: any) {
        return this.http.post(this.apiUrl, data);
    }

    getMyRentals() {
        return this.http.get<any[]>(`${this.apiUrl}/my`);
    }

    cancelRental(id: number) {
        return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
    }
}
