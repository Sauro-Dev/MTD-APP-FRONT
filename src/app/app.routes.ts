// app.routes.ts
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'admin-panel', pathMatch: 'full' },
  {
    path: 'admin-panel',
    loadChildren: () =>
      import('./features/admin-panel/admin-panel.routes').then(
        (m) => m.ADMIN_PANEL_ROUTES
      ),
  },
  { path: '**', redirectTo: 'admin-panel' }
];
