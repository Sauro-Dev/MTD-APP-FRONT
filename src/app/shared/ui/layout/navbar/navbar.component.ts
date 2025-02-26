import { Component } from '@angular/core';
import {UserDetails} from '../../../../core/interfaces/users';
import {AuthService} from '../../../../core/services/auth.service';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    NgIf,
    NgOptimizedImage,
    RouterLink
  ]
})
export class NavbarComponent {
  userDetails: UserDetails | null = null;

  constructor(private authService: AuthService) {
    this.authService.getUserDetails().then((user) => {
      this.userDetails = user;
    });
  }

  isAdmin(): boolean {
    return this.userDetails?.role === 'ADMIN';
  }
}
