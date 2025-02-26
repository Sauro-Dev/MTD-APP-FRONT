import {Component, OnInit} from '@angular/core';
import {RegisterAreaComponent} from './register-area/register-area.component';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {UserDetails} from '../../core/interfaces/user-details';
import {AuthService} from '../../core/services/auth.service';
import { AreasService } from '../../core/services/areas.service';

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
  areas: any[] = [];
  showRegisterModal = false;
  showSuccessModal = false;
  userDetails: UserDetails | null = null;

  constructor(private authService: AuthService, private areasService: AreasService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().then((user) => {
      this.userDetails = user;
    });

    // Llamar al servicio para obtener las áreas disponibles
    this.loadAreas();
  }

  loadAreas() {
    this.areasService.getPublicAreas().subscribe({
      next: (data) => {
        this.areas = data;
      },
      error: () => {
        alert('Error al cargar las áreas');
      }
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
      this.loadAreas(); // Recargar la lista de áreas después de crear una nueva
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
