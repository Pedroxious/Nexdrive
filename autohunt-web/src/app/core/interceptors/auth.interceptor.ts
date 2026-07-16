import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
  Observable
} from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

/**
 * Auth interceptor — V-05 fix (cookie-only).
 *
 * What this interceptor does NOT do anymore:
 * - Does NOT read tokens from localStorage
 * - Does NOT add Authorization: Bearer headers
 * - The httpOnly cookie is sent automatically by the browser
 *
 * What it still does:
 * - Catches 401 responses and triggers the refresh-token flow
 * - Queues concurrent requests during token refresh
 * - Forces logout if refresh fails
 *
 * withCredentials: true is set globally in app.config.ts so cookies are sent
 * on every request including cross-origin dev requests (localhost:4200 → :8080).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only intercept 401s on protected API calls (not on login/register/refresh)
      if (
        error.status === 401 &&
        !req.url.includes('/api/auth/login') &&
        !req.url.includes('/api/auth/register') &&
        !req.url.includes('/api/auth/refresh')
      ) {
        return handle401(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        // Refresh succeeded — server set new access-token cookie
        // Retry the original request; the new cookie will be sent automatically
        isRefreshing = false;
        refreshTokenSubject.next(true);
        return next(request);
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(false);
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  // Another refresh is already in flight — wait for it to complete, then retry
  return refreshTokenSubject.pipe(
    filter(result => result !== null),
    take(1),
    switchMap((success) => {
      if (success) {
        return next(request);
      }
      return throwError(() => new Error('Session expired'));
    })
  );
}
