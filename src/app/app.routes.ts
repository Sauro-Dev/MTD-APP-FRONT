import { Routes } from '@angular/router';
import { UsersGuard } from './core/guards/users.guard';
import {AdminGuard} from './core/guards/admin.guard';
import {AuthGuard} from './core/guards/auth.guard';
import {UsersComponent} from './features/users/users.component';
import { FormComponent } from './features/form/form.component'; // Importamos el FormComponent


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
    path: 'users',
    component: UsersComponent,
    canActivate: [UsersGuard],
  },

  {
    path: 'form', //  Agregamos la nueva ruta
    loadComponent: () =>
      import('./features/form/form.component').then(
        (m) => m.FormComponent
      ),
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
