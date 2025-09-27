import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
      },
      {
        path: 'quotes',
        loadComponent: () => import('./features/quotes/quotes').then((m) => m.Quotes),
        canActivate: [authGuard],
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients').then((m) => m.Clients),
        canActivate: [authGuard],
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
