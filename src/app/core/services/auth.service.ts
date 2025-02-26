import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Observable, of} from 'rxjs';
import {environment} from '../environment';
import {UserDetails} from '../interfaces/users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'token';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  readTokenFromUrl(): void {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem(this.tokenKey, tokenFromUrl);
        console.log("🔑 Token guardado desde URL:", tokenFromUrl);
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  validateToken(): Observable<boolean> {
    return of(!!this.getToken());
  }

  async getUserDetails(): Promise<UserDetails | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${environment.apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json() as UserDetails;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
}
