import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

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

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(res => {
        this.setSession(res.token, res.user);
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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.router.navigate(['/']);
  }

  private setSession(token: string, user: User) {
    this.token.set(token);
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}
