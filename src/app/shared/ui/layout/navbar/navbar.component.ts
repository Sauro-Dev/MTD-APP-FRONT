import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserDetails } from '../../../../core/interfaces/users';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [
    NgOptimizedImage,
    RouterLink,
    NgIf
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showDropdown = false;
  userDetails: UserDetails | null = null;

  constructor(public authService: AuthService) {
    this.loadUserDetails();
  }

  async loadUserDetails(): Promise<void> {
    this.userDetails = await this.authService.getUserDetails();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.showDropdown) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.userDetails?.role === 'ADMIN';
  }
}
