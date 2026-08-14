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
        loadComponent: () => import('./pages/rental-wizard/rental-wizard').then(m => m.RentalWizardComponent)
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

    // ── Institutional & Legal Portal Routes ──
    {
        path: 'legal',
        loadComponent: () => import('./pages/legal/legal-layout').then(m => m.LegalLayoutComponent),
        children: [
            {
                path: '',
                redirectTo: 'privacidade',
                pathMatch: 'full'
            },
            {
                path: 'privacidade',
                loadComponent: () => import('./pages/legal/privacy').then(m => m.PrivacyComponent)
            },
            {
                path: 'termos',
                loadComponent: () => import('./pages/legal/terms').then(m => m.TermsComponent)
            },
            {
                path: 'ajuda',
                loadComponent: () => import('./pages/legal/help').then(m => m.HelpComponent)
            },
            {
                path: 'faq',
                loadComponent: () => import('./pages/legal/faq').then(m => m.LegalFaqComponent)
            },
            {
                path: 'forum',
                loadComponent: () => import('./pages/legal/forum').then(m => m.ForumComponent)
            }
        ]
    },

    // Legacy / Alias Redirects
    {
        path: 'privacy',
        redirectTo: 'legal/privacidade',
        pathMatch: 'full'
    },
    {
        path: 'politica-de-privacidade',
        redirectTo: 'legal/privacidade',
        pathMatch: 'full'
    },
    {
        path: 'terms',
        redirectTo: 'legal/termos',
        pathMatch: 'full'
    },
    {
        path: 'termos-de-uso',
        redirectTo: 'legal/termos',
        pathMatch: 'full'
    },

    // Auth Routes
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
    },

    // 404 Error Route
    {
        path: '404',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
