import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full',
      },
      {
        path: 'landing',
        loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [authGuard],
      },
      {
        path: 'quotes',
        loadComponent: () => import('./features/quotes/quotes').then((m) => m.Quotes),
        canActivate: [authGuard],
      },
            {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/jobs').then((m) => m.Jobs),
        canActivate: [authGuard],
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients').then((m) => m.Clients),
        canActivate: [authGuard],
      },
      { path: '**', redirectTo: '/dashboard' },
    ],
  },
];

