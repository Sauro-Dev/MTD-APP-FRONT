import { Component, OnInit, signal } from '@angular/core';
import { ListUser } from '../../core/interfaces/users';
import { UsersService } from '../../core/services/users.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf } from '@angular/common';
import { ListArea } from "../../core/interfaces/ListArea";
import { AreasService } from "../../core/services/areas.service";

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    NgForOf,
    NgClass
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users = signal<ListUser[]>([]);
  filteredUsers = signal<ListUser[]>([]);
  areas = signal<ListArea[]>([]);
  roles = ['ADMIN', 'COORDINATOR', 'COUNCIL', 'MAKER'];
  searchTerm = signal<string>('');
  selectedRole = signal<string>('');
  selectedArea = signal<string>('');
  sortAscending = signal<boolean>(true);
  currentPage = signal<number>(1);
  usersPerPage = signal<number>(10);

  constructor(private usersService: UsersService, private areasService: AreasService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadAreas();
  }

  loadUsers(): void {
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.filterUsers();
      },
      error: (err) => {
        console.error('Error fetching users', err);
        alert('Error al cargar usuarios. Por favor, intenta más tarde.');
      },
    });
  }

  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        this.areas.set(data);
      },
      error: (err) => console.error('Error fetching areas', err),
    });
  }

  getUserArea(user: ListUser): string {
    const area = user.area;
    if (typeof area === 'object' && area?.name) return area.name;
    return typeof area === 'string' ? area : 'Sin área asignada';
  }

  filterUsers(): void {
    let result = this.users();

    if (this.searchTerm()) {
      result = result.filter(user =>
        `${user.name} ${user.paternalSurname} ${user.maternalSurname}`
          .toLowerCase()
          .includes(this.searchTerm().toLowerCase())
      );
    }

    if (this.selectedRole()) {
      result = result.filter(user => user.role === this.selectedRole());
    }

    if (this.selectedArea()) {
      result = result.filter(user => this.getUserArea(user) === this.selectedArea());
    }

    this.filteredUsers.set(result);
    this.currentPage.set(1);
  }

  sortUsers(): void {
    const sorted = [...this.filteredUsers()].sort((a, b) => {
      return this.sortAscending()
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    this.filteredUsers.set(sorted);
    this.sortAscending.set(!this.sortAscending());
  }

  getPaginatedUsers(): ListUser[] {
    const start = (this.currentPage() - 1) * this.usersPerPage();
    return this.filteredUsers().slice(start, start + this.usersPerPage());
  }

  nextPage(): void {
    const totalPages = Math.ceil(this.filteredUsers().length / this.usersPerPage());
    if (this.currentPage() < totalPages) {
      this.currentPage.update(current => current + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(current => current - 1);
    }
  }

  protected readonly Math = Math;
}
