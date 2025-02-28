// admin-panel.routes.ts
import { Routes } from '@angular/router';
import { AdminPanelShellComponent } from './admin-panel-shell.component';
import { AboutUsControlComponent } from './components/about-us-control/about-us-control.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LibraryComponent } from './components/library/library.component';
import { SpotifyControlComponent } from './components/spotify-control/spotify-control.component';
import {BannerComponent} from './components/banner/banner.component';
import { UsersComponent } from '../users/users.component'; //  Importamos UsersComponent
import { FormComponent } from '../form/form.component'; //  Importamos FormComponent


export const ADMIN_PANEL_ROUTES: Routes = [
  {
    path: '',
    component: AdminPanelShellComponent, // <--- EL SHELL con la NAVBAR
    children: [
      {
        path: '',
        redirectTo: 'banner-upload',
        pathMatch: 'full'
      },
      {
        path: 'banner-upload',
        component: BannerComponent,
      },
      {
        path: 'about-us-control',
        component: AboutUsControlComponent
      },
      {
        path: 'file-upload',
        component: FileUploadComponent
      },
      {
        path: 'library',
        component: LibraryComponent
      },
      {
        path: 'spotify-control',
        component: SpotifyControlComponent
      },

      {
        path: 'users', // Agregamos la ruta de usuarios
        component: UsersComponent
      },
      {
        path: 'form', //  Agregamos la ruta para el formulario
        component: FormComponent
      },

      {
        path: '**',
        redirectTo: 'about-us-control'
      }
    ]
  }
];
