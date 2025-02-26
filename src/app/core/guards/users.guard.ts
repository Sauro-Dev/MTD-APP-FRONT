import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthCheckService } from '../services/auth-check.service';

@Injectable({
  providedIn: 'root',
})
export class UsersGuard implements CanActivate {
  constructor(private authCheckService: AuthCheckService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { isAuthenticated, user } = await this.authCheckService.checkAuthStatus();
    if (!isAuthenticated || user?.role === 'MAKER') {
      await this.router.navigate(['/no-access']);
      return false;
    }
    return true;
  }
}
