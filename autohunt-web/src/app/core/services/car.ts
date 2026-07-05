import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Vehicle, Page, VehicleImage } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private apiUrl = '/api/vehicles';

  selectedLocation = signal<string>('Todos');

  getCars(filters: any = {}): Observable<Page<Vehicle>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v: any) => { params = params.append(key, v); });
        } else {
          params = params.set(key, value);
        }
      }
    });
    return this.http.get<Page<Vehicle>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getGalleryImages(vehicleId: number): Observable<VehicleImage[]> {
    return this.http.get<VehicleImage[]>(`${this.apiUrl}/${vehicleId}/images`);
  }

  getFeatured(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/featured`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  search(q: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/search`, { params: new HttpParams().set('q', q) });
  }
}
