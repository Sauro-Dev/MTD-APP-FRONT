import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import {NavbarComponent} from './shared/ui/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavbarComponent]
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.readTokenFromUrl();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.validateToken().subscribe(isValid => {
        if (!isValid) {
          console.warn('Redirigiendo a /no-auth por token inválido...');
          void this.router.navigate(['/no-auth']);
        }
      });
    }
  }
}
