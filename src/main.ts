import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {authInterceptor} from './app/core/interceptors/AuthInterceptor';
import {logInterceptor} from './app/core/interceptors/LogInterceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, logInterceptor])),
    provideRouter(appRoutes)
  ]
}).catch(err => console.error(err));
