import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrafficSummary {
  totalRequests24h: number;
  blockedRequests24h: number;
  suspiciousRequests24h: number;
  uniqueIps24h: number;
  totalRequests30d: number;
  blockedRequests30d: number;
  suspiciousRequests30d: number;
  uniqueIps30d: number;
}

export interface TrafficTimelinePoint {
  label: string;
  periodKey: string;
  totalRequests: number;
  blockedRequests: number;
  suspiciousRequests: number;
}

export interface TopIp {
  ipAddress: string;
  totalRequests: number;
  blockedCount: number;
  suspiciousCount: number;
  lastSeen: string;
  sampleUserAgent: string;
}

export interface TopRoute {
  endpoint: string;
  method: string;
  totalRequests: number;
  avgResponseTimeMs: number;
}

export interface RequestLogItem {
  id: number;
  ipAddress: string;
  endpoint: string;
  method: string;
  userAgent: string;
  statusCode: number;
  timestamp: string;
  responseTimeMs: number;
  blockedByRateLimit: boolean;
  isSuspicious: boolean;
  suspiciousReason: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrafficAdminService {
  private http = inject(HttpClient);
  private apiUrl = '/api/admin/traffic';

  getSummary(): Observable<TrafficSummary> {
    return this.http.get<TrafficSummary>(`${this.apiUrl}/summary`);
  }

  getHourly(): Observable<TrafficTimelinePoint[]> {
    return this.http.get<TrafficTimelinePoint[]>(`${this.apiUrl}/hourly`);
  }

  getDaily(): Observable<TrafficTimelinePoint[]> {
    return this.http.get<TrafficTimelinePoint[]>(`${this.apiUrl}/daily`);
  }

  getTopIps(limit = 15): Observable<TopIp[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopIp[]>(`${this.apiUrl}/top-ips`, { params });
  }

  getTopRoutes(limit = 15): Observable<TopRoute[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopRoute[]>(`${this.apiUrl}/top-routes`, { params });
  }

  getRecentLogs(filter = 'all', page = 0, size = 20): Observable<PageResponse<RequestLogItem>> {
    const params = new HttpParams()
      .set('filter', filter)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<RequestLogItem>>(`${this.apiUrl}/recent-logs`, { params });
  }
}
