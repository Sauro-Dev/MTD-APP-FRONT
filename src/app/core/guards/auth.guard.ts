import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import {AuthCheckService} from '../services/auth-check.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authCheckService: AuthCheckService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const { isAuthenticated } = await this.authCheckService.checkAuthStatus();
    return isAuthenticated || this.router.createUrlTree(['/no-auth']);
  }
}
