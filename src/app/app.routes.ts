import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'admin-panel', pathMatch: 'full' },
  {
    path: 'admin-panel',
    loadChildren: () =>
      import('./features/admin-panel/admin-panel.routes').then(
        (m) => m.ADMIN_PANEL_ROUTES
      ),
    canActivate: [AuthGuard],
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
  { path: '**', redirectTo: 'admin-panel' },
];
