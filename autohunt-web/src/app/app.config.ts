import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';

import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import {
  LucideAngularModule,
  Search, X, Car, MapPin, ChevronDown, Bell, PlusCircle,
  Sun, Moon, Menu, User, LogOut, Heart, CalendarDays,
  LogIn, Check, Instagram, Twitter, Facebook, Linkedin,
  Send, ShieldCheck, Lock, Fuel, Settings2, Users,
  ArrowRight, MessageCircle, Mail
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideAnimations(),
    /**
     * V-05 fix: withFetch() enables the Fetch API backend which properly supports
     * credentials (cookies) in cross-origin requests.
     *
     * withCredentials is NOT set here globally via an option — instead the auth interceptor
     * and all services rely on same-origin requests in production (Angular is served from Spring Boot).
     * For cross-origin dev (localhost:4200 → :8080), the CORS config allows credentials
     * and the browser sends httpOnly cookies automatically on same-site requests.
     *
     * If you need explicit withCredentials on every request (e.g. different-origin deployment),
     * add a credentials interceptor that clones each request with { withCredentials: true }.
     */
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Search, X, Car, MapPin, ChevronDown, Bell, PlusCircle,
        Sun, Moon, Menu, User, LogOut, Heart, CalendarDays,
        LogIn, Check, Instagram, Twitter, Facebook, Linkedin,
        Send, ShieldCheck, Lock, Fuel, Settings2, Users,
        ArrowRight, MessageCircle, Mail
      })
    ),
    importProvidersFrom(MatNativeDateModule)
  ]
};
