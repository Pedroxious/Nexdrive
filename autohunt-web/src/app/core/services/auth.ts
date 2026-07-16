import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, throwError } from 'rxjs';

export interface User {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/auth';

  currentUser = signal<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  isLoggedIn = signal<boolean>(!!this.currentUser());
  token = signal<string | null>(localStorage.getItem('token'));
  refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(res => {
        this.setSession(res.token, res.refreshToken, res.user);
      })
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  getMe() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  updateMe(user: Partial<User>) {
    return this.http.put<User>(`/api/users/me`, user).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.token.set(null);
    this.refreshToken.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.router.navigate(['/']);
  }

  refreshAccessToken() {
    const refreshToken = this.refreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token não encontrado'));
    }

    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap({
        next: (res) => {
          this.setSession(res.token, res.refreshToken, res.user);
        },
        error: (err) => {
          this.logout();
        }
      })
    );
  }

  private setSession(token: string, refreshToken: string, user: User) {
    this.token.set(token);
    this.refreshToken.set(refreshToken);
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
}
