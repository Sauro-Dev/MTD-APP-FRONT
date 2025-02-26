import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import {AuthCheckService} from '../services/auth-check.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private authCheckService: AuthCheckService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const { isAuthenticated, user } = await this.authCheckService.checkAuthStatus();
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      return this.router.createUrlTree(['/no-access']);
    }
    return true;
  }
}
