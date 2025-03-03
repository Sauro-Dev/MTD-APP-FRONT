import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {StorageService} from './storage.service';
import {UserDetails} from '../interfaces/users';
import {environment} from '../environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private tokenKey = 'token';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  readTokenFromUrl(): void {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        this.storageService.setItem('token', tokenFromUrl);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }

  getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.storageService.removeItem(this.tokenKey);
    window.dispatchEvent(new Event('storage'));
  }

  logout(): void {
    this.removeToken();
    window.dispatchEvent(new Event('storage'));
    window.location.href = 'http://localhost:5173/home?logout=true';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async handleStorageChange(event: StorageEvent): Promise<void> {
    if (event.key === this.tokenKey && event.newValue === null) {
      try {
        await this.router.navigateByUrl('/');
        window.location.reload();
      } catch (error) {
        console.error('Error en redirección:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('storage', this.handleStorageChange);
    }
  }

  async getUserDetails(): Promise<UserDetails | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${environment.apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }
}
