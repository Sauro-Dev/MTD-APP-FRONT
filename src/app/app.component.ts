import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import {isPlatformBrowser, NgIf} from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/ui/layout/navbar/navbar.component';
import {AuthCheckService} from './core/services/auth-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavbarComponent, NgIf],
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private authCheckService = inject(AuthCheckService);
  private router = inject(Router);
  showNavbar = true;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.readTokenFromUrl();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.readTokenFromUrl();
      this.authCheckService.checkAuthStatus().then(({ isAuthenticated }) => {
        if (!isAuthenticated) {
          void this.router.navigateByUrl('/no-auth');
        }
      });
    }

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNavbar = !['/no-auth', '/no-access'].includes(event.url);
        }
      });
    }
}

