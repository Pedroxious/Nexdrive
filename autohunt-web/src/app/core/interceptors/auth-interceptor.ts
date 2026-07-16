/**
 * @deprecated This file is kept as a stub for backwards compatibility with any
 * import paths that reference auth-interceptor.ts (without the dot).
 * The active interceptor is at ./auth.interceptor.ts
 * This stub is a no-op — it does not add any headers or modify requests.
 */
import { HttpInterceptorFn } from '@angular/common/http';

export const legacyAuthInterceptor: HttpInterceptorFn = (req, next) => next(req);
