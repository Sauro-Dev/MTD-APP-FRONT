import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  async canActivate(): Promise<boolean | UrlTree> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn("🚫 SSR detectado: Saltando validación de localStorage.");
      return this.router.createUrlTree(['/no-auth']);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("🚫 No hay token, redirigiendo a /no-auth.");
      return this.router.createUrlTree(['/no-auth']);
    }

    const isValid = await this.isTokenValid(token);
    if (!isValid) {
      console.warn("🚫 Token inválido, eliminando y redirigiendo a /no-auth.");
      localStorage.removeItem("token");
      return this.router.createUrlTree(['/no-auth']);
    }

    return true;
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
