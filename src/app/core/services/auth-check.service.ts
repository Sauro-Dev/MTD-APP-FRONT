import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../environment';
import {UserDetails} from '../interfaces/users';

@Injectable({ providedIn: 'root' })
export class AuthCheckService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {}

  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: UserDetails | null }> {
    if (!isPlatformBrowser(this.platformId)) {
      return { isAuthenticated: false, user: null };
    }

    const token = this.authService.getToken();
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    try {
      const [isValid, userDetails] = await Promise.all([
        this.isTokenValid(token),
        this.authService.getUserDetails()
      ]);

      if (!isValid || !userDetails) {
        this.authService.removeToken();
        return { isAuthenticated: false, user: null };
      }

      return { isAuthenticated: true, user: userDetails };
    } catch {
      this.authService.removeToken();
      return { isAuthenticated: false, user: null };
    }
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiUrl}/users/validate-token`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
