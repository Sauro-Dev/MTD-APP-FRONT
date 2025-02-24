import {Component, OnInit} from '@angular/core';
import {RegisterAreaComponent} from './register-area/register-area.component';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {UserDetails} from '../../core/interfaces/user-details';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  imports: [
    RegisterAreaComponent,
    NgIf,
    NgForOf, CommonModule
  ],
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit {
  areas = [{ name: 'Marketing' }];
  showRegisterModal = false;
  showSuccessModal = false;
  userDetails: UserDetails | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().then((user) => {
      this.userDetails = user;
    });
  }

  openRegisterModal() {
    if (this.userDetails?.role === 'ADMIN') {
      this.showRegisterModal = true;
    } else {
      alert('No tienes permisos para registrar un área.');
    }
  }

  closeRegisterModal(confirmed: boolean) {
    this.showRegisterModal = false;
    if (confirmed) {
      this.showSuccessModal = true;
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
