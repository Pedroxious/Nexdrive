import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referenceType?: string;
  referenceId?: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/notifications';

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal<number>(0);

  /**
   * Cleans emoji characters from string as per strict global project rules.
   */
  private sanitize(str: string): string {
    if (!str) return '';
    return str.replaceAll(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  }

  fetchNotifications(): void {
    this.http.get<AppNotification[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    ).subscribe((list) => {
      const cleanList = list.map(n => ({
        ...n,
        title: this.sanitize(n.title),
        message: this.sanitize(n.message)
      }));
      this.notifications.set(cleanList);
    });

    this.fetchUnreadCount();
  }

  fetchUnreadCount(): void {
    this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`).pipe(
      catchError(() => of({ unreadCount: 0 }))
    ).subscribe((res) => {
      this.unreadCount.set(res.unreadCount || 0);
    });
  }

  markAsRead(id: number): void {
    this.http.put<AppNotification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.notifications.update(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      this.fetchUnreadCount();
    });
  }

  markAllRead(): void {
    this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      catchError(() => of(undefined))
    ).subscribe(() => {
      this.notifications.update(prev => prev.map(n => ({ ...n, read: true })));
      this.unreadCount.set(0);
    });
  }
}
