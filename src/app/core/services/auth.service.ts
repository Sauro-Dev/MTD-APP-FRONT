import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { Observable, of } from 'rxjs';
import {environment} from '../environment';
import {UserDetails} from '../interfaces/user-details';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  readTokenFromUrl(): void {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
      }
    }
  }

  validateToken(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return of(!!token);
    }
    return of(false);
  }

  async getUserDetails(): Promise<UserDetails | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

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
