import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Vehicle, Page, VehicleImage } from '../models/vehicle.model';

const FALLBACK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    name: 'Toyota Corolla Cross XRE',
    brand: 'Toyota',
    model: 'Corolla Cross XRE',
    year: 2024,
    pricePerDay: 249,
    salePrice: 179900,
    categoryName: 'SUV',
    categoryId: 1,
    supplierId: 1,
    supplierName: 'Movida',
    available: true,
    airConditioning: true,
    city: 'São Paulo',
    state: 'SP',
    transmission: 'Automático',
    fuelType: 'Flex',
    mileage: 12000,
    seats: 5,
    doors: 4,
    color: 'Prata Nevoa',
    imageUrl: 'https://i.imgur.com/K8J4X3w.jpeg',
    description: 'Toyota Corolla Cross XRE 2.0 Flex 2024 com apenas 12.000km. Impecável, único dono, todas as revisões na concessionária.',
    rating: 4.9,
    reviewsCount: 28
  },
  {
    id: 2,
    name: 'Jeep Compass Longitude',
    brand: 'Jeep',
    model: 'Compass Longitude',
    year: 2023,
    pricePerDay: 289,
    salePrice: 154900,
    categoryName: 'SUV',
    categoryId: 1,
    supplierId: 2,
    supplierName: 'Localiza',
    available: true,
    airConditioning: true,
    city: 'Rio de Janeiro',
    state: 'RJ',
    transmission: 'Automático',
    fuelType: 'Flex',
    mileage: 22000,
    seats: 5,
    doors: 4,
    color: 'Preto Carbon',
    imageUrl: 'https://i.imgur.com/8QZ9X3w.jpeg',
    description: 'Jeep Compass Longitude T270 Flex 2023. Motor Turbo 185cv, bancos em couro, faróis Full LED e painel 100% digital.',
    rating: 4.8,
    reviewsCount: 35
  },
  {
    id: 3,
    name: 'BMW 320i M Sport',
    brand: 'BMW',
    model: '320i M Sport',
    year: 2024,
    pricePerDay: 599,
    salePrice: 319900,
    categoryName: 'Sedan Premium',
    categoryId: 2,
    supplierId: 3,
    supplierName: 'Unidas',
    available: true,
    airConditioning: true,
    city: 'São Paulo',
    state: 'SP',
    transmission: 'Automático',
    fuelType: 'Gasolina',
    mileage: 8500,
    seats: 5,
    doors: 4,
    color: 'Branco Alpino',
    imageUrl: 'https://i.imgur.com/5W3J9Xk.jpeg',
    description: 'BMW 320i M Sport 2.0 Turbo 2024. O ápice do luxo e da esportividade alemã.',
    rating: 5.0,
    reviewsCount: 42
  }
];

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
    return this.http.get<Page<Vehicle>>(this.apiUrl, { params }).pipe(
      catchError(() => of({
        content: FALLBACK_VEHICLES,
        totalElements: FALLBACK_VEHICLES.length,
        totalPages: 1,
        size: 12,
        number: 0
      }))
    );
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = FALLBACK_VEHICLES.find(v => v.id === +id) || FALLBACK_VEHICLES[0];
        return of(found);
      })
    );
  }

  getGalleryImages(vehicleId: number): Observable<VehicleImage[]> {
    return this.http.get<VehicleImage[]>(`${this.apiUrl}/${vehicleId}/images`).pipe(
      catchError(() => of([
        { id: 1, position: 1, imageUrl: 'https://i.imgur.com/K8J4X3w.jpeg' },
        { id: 2, position: 2, imageUrl: 'https://i.imgur.com/8QZ9X3w.jpeg' }
      ]))
    );
  }

  getFeatured(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/featured`).pipe(
      catchError(() => of(FALLBACK_VEHICLES))
    );
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`).pipe(
      catchError(() => of(['Toyota', 'Jeep', 'BMW', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Honda']))
    );
  }

  search(q: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/search`, { params: new HttpParams().set('q', q) }).pipe(
      catchError(() => of(FALLBACK_VEHICLES.filter(v => v.brand.toLowerCase().includes(q.toLowerCase()) || v.model.toLowerCase().includes(q.toLowerCase()))))
    );
  }
}
