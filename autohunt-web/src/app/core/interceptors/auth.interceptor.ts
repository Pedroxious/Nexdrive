import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, Observable } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.token();

    let clonedReq = req;
    if (token) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/refresh') && !req.url.includes('/api/auth/register')) {
                return handle401Error(clonedReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshAccessToken().pipe(
            switchMap((res: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(res.token);
                return next(request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${res.token}`
                    }
                }));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next(request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            })))
        );
    }
}
