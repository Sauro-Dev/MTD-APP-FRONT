import { Routes } from '@angular/router';
import { AboutUsControlComponent } from './components/about-us-control/about-us-control.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LibraryComponent } from './components/library/library.component';
import { SpotifyControlComponent } from './components/spotify-control/spotify-control.component';

export const ADMIN_PANEL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'about-us-control',
    pathMatch: 'full'
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
    path: '**',
    redirectTo: 'about-us-control'
  }
];
