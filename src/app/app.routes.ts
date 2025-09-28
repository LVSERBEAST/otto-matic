import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Clients } from './features/clients/clients';
import { Dashboard } from './features/dashboard/dashboard';
import { Jobs } from './features/jobs/jobs';
import { Landing } from './features/landing/landing';
import { Quotes } from './features/quotes/quotes';
import { PublicLayout } from './shared/layout/public-layout/public-layout';
import { AdminLayout } from './shared/layout/admin-layout/admin-layout';
import { About } from './features/about/about';
import { Contact } from './features/contact/contact';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'quotes', component: Quotes },
      { path: 'jobs', component: Jobs },
      { path: 'clients', component: Clients },
    ],
  },
];