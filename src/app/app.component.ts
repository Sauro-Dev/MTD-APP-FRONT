import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.readTokenFromUrl();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.validateToken();
    }
  }

  private readTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      console.log("✅ Token recibido desde la URL y guardado en localStorage.");
    }
  }

  private async validateToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("🚫 No hay token, redirigiendo a /no-auth.");
      this.router.navigate(['/no-auth']);
      return;
    }

    const isValid = await this.isTokenValid(token);
    if (!isValid) {
      console.warn("🚫 Token inválido, redirigiendo a /no-auth.");
      localStorage.removeItem("token");
      this.router.navigate(['/no-auth']);
    }
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:8080/api/v1/users/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
