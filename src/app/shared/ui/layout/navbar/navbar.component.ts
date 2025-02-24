import {Component, OnInit} from '@angular/core';
import {CommonModule, NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {UserDetails} from '../../../../core/interfaces/user-details';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    NgIf, CommonModule, NgOptimizedImage, RouterLink
  ]
})
export class NavbarComponent implements OnInit {
  userDetails: UserDetails | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().then((user) => {
      this.userDetails = user;
    });
  }

  isAdmin(): boolean {
    return this.userDetails?.role === 'ADMIN';
  }
}
