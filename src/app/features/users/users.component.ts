import {Component, OnInit, signal} from '@angular/core';
import {ListUser} from '../../core/interfaces/users';
import {UsersService} from '../../core/services/users.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf} from '@angular/common';
import {ListArea} from "../../core/interfaces/ListArea";
import {AreasService} from "../../core/services/areas.service";

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
  roles = ['ADMIN', 'COORDINATOR', 'COUNCIL'];
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
        const filtered = data.filter((user) => this.roles.includes(user.role));
        this.users.set(filtered);
        this.filterUsers(); // Aplicamos filtro inicial
      },
      error: (err) => console.error('Error fetching users', err),
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
      result = result.filter(user => user.region === this.selectedArea()); // Filtra por área
    }

    this.filteredUsers.set(result);
    this.currentPage.set(1); // Reiniciar paginación
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
    if (this.currentPage() < Math.ceil(this.filteredUsers().length / this.usersPerPage())) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  protected readonly Math = Math;
}
