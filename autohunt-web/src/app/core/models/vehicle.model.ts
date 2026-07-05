export interface VehicleImage {
    id: number;
    position: number;
    imageUrl: string;
}

export interface Vehicle {
    id: number;
    name: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    imageUrl: string;
    galleryImages?: VehicleImage[];
    transmission: string;
    seats: number;
    doors: number;
    airConditioning: boolean;
    categoryId: number;
    categoryName: string;
    supplierId: number;
    supplierName: string;
    available: boolean;
    fuelType: string;
    color?: string;
    mileage?: number;
    salePrice?: number;
    badge?: string;
    city?: string;
    state?: string;
    description?: string;
    isNew?: boolean;
    freeTestDrive?: boolean;
    category?: string;     // raw backend field
    new?: boolean;         // raw backend field (maps to isNew)
    [key: string]: any;    // allow dynamic access
}

export interface Category {
    id: number;
    name: string;
    description: string;
    minPrice: number;
    imageUrl: string;
}

export interface Supplier {
    id: number;
    name: string;
    rating: number;
    isFeatured: boolean;
    logoUrl: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
