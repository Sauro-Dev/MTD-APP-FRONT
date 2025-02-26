import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class AuthCheckService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {}

  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: any }> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn("🚫 SSR detectado: Saltando validación de localStorage.");
      return { isAuthenticated: false, user: null };
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn("🚫 No hay token, redirigiendo a /no-auth.");
      return { isAuthenticated: false, user: null };
    }

    const isValid = await this.isTokenValid(token);
    if (!isValid) {
      console.warn("🚫 Token inválido, eliminando y redirigiendo a /no-auth.");
      localStorage.removeItem("token");
      return { isAuthenticated: false, user: null };
    }

    const user = await this.authService.getUserDetails();
    return { isAuthenticated: true, user };
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiUrl}/users/validate-token`, {
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
