import { Component, OnInit, signal } from '@angular/core';
import { VolunteerService } from '../../core/services/volunteer.service';
import { VolunteerPending } from '../../core/interfaces/volunteer';
import { FormsModule } from '@angular/forms';
import { NgForOf, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListArea } from '../../core/interfaces/ListArea';
import { AreasService } from '../../core/services/areas.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgForOf,
    RouterModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  volunteers = signal<VolunteerPending[]>([]);
  filteredVolunteers = signal<VolunteerPending[]>([]);
  areas = signal<ListArea[]>([]);
  searchTerm = signal<string>('');
  selectedArea = signal<number | null>(null);
  currentPage = signal<number>(1);
  formsPerPage = signal<number>(10);

  /** Hace que Math esté disponible en el HTML (para la paginación) */
  protected readonly Math = Math;

  constructor(
    private volunteerService: VolunteerService,
    private areasService: AreasService
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.loadVolunteers();
  }

  /**
   * Carga todas las áreas existentes en el sistema
   */
  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        this.areas.set(data);
      },
      error: (err) => console.error('Error al obtener áreas', err),
    });
  }

  /**
   * Carga todos los voluntarios pendientes desde el backend
   * y los mapea para mostrar datos más legibles (área, horas, etc.).
   */
  loadVolunteers(): void {
    this.volunteerService.getPendingVolunteers().subscribe({
      next: (data) => {
        // Mapeo para mostrar datos más legibles (pais, region, area, horas)
        const volunteersMapped = data.map(volunteer => ({
          ...volunteer,
          // Si country/region no viene, poner "No especificado"
          country: volunteer.country || 'No especificado',
          region: volunteer.region || 'No especificado',
          // Convertimos areaId a nombre de área en este paso para la tabla
          areaId: this.getAreaName(volunteer.areaId),
          // Convertimos estimatedHours a un formato legible
          estimatedHours: this.formatEstimatedHours(volunteer.estimatedHours)
        }));
        this.volunteers.set(volunteersMapped);
        this.filterForms();
      },
      error: (err) => {
        console.error('Error al cargar formularios', err);
        alert('Error al cargar formularios. Por favor, intenta más tarde.');
      },
    });
  }

  /**
   * Aplica el filtro de búsqueda y el filtro por área.
   */
  filterForms(): void {
    let result = this.volunteers();

    // Filtro por texto (búsqueda)
    if (this.searchTerm()) {
      const searchLower = this.searchTerm().toLowerCase();
      result = result.filter(volunteer =>
        `${volunteer.name} ${volunteer.paternalSurname} ${volunteer.maternalSurname}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    // Filtro por área
    if (this.selectedArea() !== null) {
      // Nota: volunteer.areaId aquí ya es un string con el nombre del área,
      // porque lo convertimos en loadVolunteers().
      // Si quisiéramos filtrar por ID, necesitaríamos la info original.
      // (O cambiar la lógica para mantener un 'areaIdOriginal' aparte).
      const selectedAreaName = this.getAreaName(String(this.selectedArea()));
      result = result.filter(volunteer =>
        volunteer.areaId === selectedAreaName
      );
    }

    this.filteredVolunteers.set(result);
    this.currentPage.set(1);
  }

  /**
   * Retorna la lista de voluntarios paginados.
   */
  getPaginatedVolunteers(): VolunteerPending[] {
    const start = (this.currentPage() - 1) * this.formsPerPage();
    return this.filteredVolunteers().slice(start, start + this.formsPerPage());
  }

  /**
   * Dado un areaId (numérico como string),
   * busca el nombre real en la lista de áreas.
   */
  getAreaName(areaId: string): string {
    if (!areaId) return 'Sin área';
    const areaFound = this.areas().find(a => String(a.id) === areaId);
    return areaFound ? areaFound.name : 'Sin área';
  }

  /**
   * Mapea las horas estimadas (ej: 'THREE') a un string legible ('3 horas').
   */
  formatEstimatedHours(estimatedHours: string): string {
    const estimatedHoursMap: { [key: string]: string } = {
      'ONE': '1 hora',
      'TWO': '2 horas',
      'THREE': '3 horas',
      'FOUR': '4 horas',
      'FIVE': '5 horas',
      'SIX': '6 horas',
      'SEVEN': '7 horas',
      'EIGHT': '8 horas',
      'NINE': '9 horas',
      'TEN_PLUS': '+10 horas'
    };
    return estimatedHoursMap[estimatedHours] || estimatedHours;
  }

  /**
   * Manejo de paginación: siguiente página
   */
  nextPage(): void {
    const totalPages = Math.ceil(this.filteredVolunteers().length / this.formsPerPage());
    if (this.currentPage() < totalPages) {
      this.currentPage.update(current => current + 1);
    }
  }

  /**
   * Manejo de paginación: página anterior
   */
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(current => current - 1);
    }
  }
}
