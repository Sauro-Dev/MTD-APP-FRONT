import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'admin-panel', pathMatch: 'full' },
  {
    path: 'admin-panel',
    loadChildren: () =>
      import('./features/admin-panel/admin-panel.routes').then(
        (m) => m.ADMIN_PANEL_ROUTES
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'areas',
    loadComponent: () =>
      import('./features/areas/areas.component').then(
        (m) => m.AreasComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'no-auth',
    loadComponent: () =>
      import('./auth/no-auth/no-auth.component').then(
        (m) => m.NoAuthComponent
      ),
  },
  {
    path: 'no-access',
    loadComponent: () =>
      import('./auth/no-access/no-access.component').then(
        (m) => m.NoAccessComponent
      ),
  },
  { path: '**', redirectTo: 'admin-panel' },
];
