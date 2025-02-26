import { Component, OnInit, signal } from '@angular/core';
import { RegisterAreaComponent } from './register-area/register-area.component';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { UserDetails } from '../../core/interfaces/users';
import { AuthService } from '../../core/services/auth.service';
import { AreasService } from '../../core/services/areas.service';
import { UsersService } from '../../core/services/users.service';
import { FormsModule } from '@angular/forms';
import { ListArea } from '../../core/interfaces/ListArea';
import { ListUser } from '../../core/interfaces/users';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  imports: [RegisterAreaComponent, NgIf, NgForOf, CommonModule, FormsModule],
  styleUrls: ['./areas.component.css'],
})
export class AreasComponent implements OnInit {
  areas = signal<ListArea[]>([]);
  users = signal<ListUser[]>([]);
  filteredUsers = signal<ListUser[]>([]);
  showRegisterModal = false;
  showSuccessModal = false;
  userDetails: UserDetails | null = null;
  searchTerm = signal<string>(''); // ✅ Definir searchTerm correctamente

  constructor(private authService: AuthService, private areasService: AreasService, private usersService: UsersService) {}

  ngOnInit(): void {
    this.authService.getUserDetails().then((user) => {
      this.userDetails = user;
    });
    this.loadAreas();
    this.loadUsers();
  }

  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        console.log("🔍 Áreas recibidas del backend:", data);
        this.areas.set(data);
      },
      error: (err) => console.error('❌ Error al obtener áreas:', err),
    });
  }

  loadUsers(): void {
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        console.log("👤 Usuarios recibidos:", data);
        this.users.set(data);
        this.filteredUsers.set(data);
      },
      error: (err) => console.error('❌ Error al obtener usuarios:', err),
    });
  }

  filterUsers(): void {
    this.filteredUsers.set(
      this.users().filter(user =>
        user.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user.paternalSurname.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user.maternalSurname.toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
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
      this.loadAreas();
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
