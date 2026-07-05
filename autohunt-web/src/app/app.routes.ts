import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'buy',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'rent',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'car/:id',
        loadComponent: () => import('./pages/car-detail/car-detail').then(m => m.CarDetailComponent)
    },
    {
        path: 'rent/:id',
        loadComponent: () => import('./pages/rental-wizard/rental-wizard').then(m => m.RentalWizardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'favorites',
        loadComponent: () => import('./pages/favorites/favorites').then(m => m.FavoritesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'my-rentals',
        loadComponent: () => import('./pages/my-rentals/my-rentals').then(m => m.MyRentalsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'sell-car',
        loadComponent: () => import('./pages/sell-car/sell-car').then(m => m.SellCarComponent),
        canActivate: [authGuard]
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
    },
    {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq').then(m => m.FAQComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
    },
    {
        path: 'privacy',
        loadComponent: () => import('./pages/legal/privacy').then(m => m.PrivacyComponent)
    },
    {
        path: 'terms',
        loadComponent: () => import('./pages/legal/terms').then(m => m.TermsComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
    },
    {
        path: '404',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
