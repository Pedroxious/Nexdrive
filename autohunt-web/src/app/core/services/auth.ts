import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, throwError, EMPTY } from 'rxjs';

export interface User {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role?: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

/**
 * AuthService — V-05 fix (cookie-only token storage).
 *
 * Tokens (access + refresh) are stored EXCLUSIVELY in httpOnly cookies set by the server.
 * They are never accessible to JavaScript. This eliminates XSS-based token theft.
 *
 * The frontend no longer stores or transmits tokens — the browser sends cookies automatically
 * on every same-site request. For cross-origin dev (localhost:4200 → :8080), Angular's
 * HttpClient is configured with withCredentials: true globally (see app.config.ts).
 *
 * User profile data (name, photo, etc.) is kept in an in-memory signal and reloaded
 * from /api/auth/me on app initialization (see AppComponent or APP_INITIALIZER).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/auth';

  // User data kept in memory only — never persisted in localStorage
  currentUser = signal<User | null>(null);
  isLoggedIn  = signal<boolean>(false);

  /**
   * Called once on app startup to restore session state from httpOnly cookie.
   * If the cookie is valid, the server returns the user DTO and we populate the signal.
   * If the cookie is missing or expired, we stay logged out.
   */
  restoreSession() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap({
        next: (user) => {
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        },
        error: () => {
          // Cookie absent or expired — normal unauthenticated state, no action needed
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ user: User }>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(res => {
        // Server sets httpOnly cookies — we only store the user profile data in memory
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  register(dto: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
  }) {
    return this.http.post<{ user: User }>(`${this.apiUrl}/register`, dto).pipe(
      tap(res => {
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  getMe() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      })
    );
  }

  updateMe(dto: Partial<Pick<User, 'fullName' | 'phone' | 'cpf' | 'birthDate'> & { profileImageUrl?: string }>) {
    return this.http.put<User>('/api/users/me', dto).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
      })
    );
  }

  logout() {
    // Server clears httpOnly cookies and invalidates the DB session
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    // Clear in-memory state
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  /**
   * Called by the auth interceptor when a 401 is received.
   * Sends the refresh request — the refreshToken httpOnly cookie is included automatically.
   * On success, the server sets a new access-token cookie and returns the user DTO.
   */
  refreshAccessToken() {
    return this.http.post<{ user: User }>(`${this.apiUrl}/refresh`, {}).pipe(
      tap({
        next: (res) => {
          this.currentUser.set(res.user);
          this.isLoggedIn.set(true);
        },
        error: () => {
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
        }
      })
    );
  }
}
