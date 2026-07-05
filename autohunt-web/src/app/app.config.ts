import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
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


