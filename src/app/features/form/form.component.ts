import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VolunteerService } from '../../core/services/volunteer.service';
import { VolunteerPending } from '../../core/interfaces/volunteer';
import { FormsModule } from '@angular/forms';
import { NgForOf, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListArea } from '../../core/interfaces/ListArea';
import { AreasService } from '../../core/services/areas.service';
import { NotificationService } from '../../core/services/notification.service';

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
  selectedArea = signal<string>('');
  currentPage = signal<number>(1);
  formsPerPage = signal<number>(10);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  noData = signal<boolean>(false);

  /** Hace que Math esté disponible en el HTML (para la paginación) */
  protected readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private volunteerService: VolunteerService,
    private areasService: AreasService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.loadVolunteers();

    // Verificar si venimos de una actualización (aprobación/rechazo)
    this.route.queryParams.subscribe(params => {
      if (params['updated'] === 'true') {
        const action = params['action'];
        const userId = params['userId'];

        if (action === 'approved') {
          this.notificationService.showSuccess(`Voluntario #${userId} aprobado correctamente`);
        } else if (action === 'rejected') {
          this.notificationService.showInfo(`Solicitud de voluntario #${userId} rechazada`);
        }
      }
    });
  }

  /**
   * Carga todas las áreas existentes en el sistema
   */
  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        this.areas.set(data);
      },
      error: (err) => {
        console.error('Error al obtener áreas', err);
        this.error.set('Error al cargar las áreas. Por favor, intente más tarde.');
        this.notificationService.showError('Error al cargar las áreas');
      },
    });
  }

  /**
   * Carga todos los voluntarios pendientes desde el backend
   * y los mapea para mostrar datos más legibles (área, horas, etc.).
   */
  loadVolunteers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.noData.set(false);

    this.volunteerService.getPendingVolunteers().subscribe({
      next: (data) => {

        if (data.length === 0) {
          this.noData.set(true);
          this.volunteers.set([]);
          this.filteredVolunteers.set([]);
          this.loading.set(false);
          return;
        }

        // Mapeo para mostrar datos más legibles
        const volunteersMapped = data.map(volunteer => ({
          ...volunteer,
          // Si el área tiene nombre, usarlo; de lo contrario, buscar por ID
          areaName: volunteer.areaName || this.getAreaName(String(volunteer.areaId || '')),
          // Convertimos estimatedHours a un formato legible
          estimatedHours: this.formatEstimatedHours(volunteer.estimatedHours)
        }));

        this.volunteers.set(volunteersMapped);
        this.filterForms();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar formularios', err);
        const errorMsg = 'Error al cargar formularios: ' + (err.message || 'Error desconocido');
        this.error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        this.loading.set(false);
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
          .includes(searchLower) ||
        volunteer.dni?.toLowerCase().includes(searchLower) ||
        volunteer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por área
    if (this.selectedArea() && this.selectedArea() !== '') {
      // Buscar por areaId o por areaName
      result = result.filter(volunteer =>
        String(volunteer.areaId) === this.selectedArea() ||
        volunteer.areaName === this.getAreaName(this.selectedArea())
      );
    }

    this.filteredVolunteers.set(result);
    this.currentPage.set(1);

    // Si después de filtrar no hay resultados, mostrar mensaje
    if (result.length === 0 && this.volunteers().length > 0) {
      this.noData.set(true);
    } else {
      this.noData.set(false);
    }
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
    if (!areaId || areaId === '') return 'Sin área';

    // Convertir a número para comparación directa
    const areaIdNum = Number(areaId);

    // Buscar por coincidencia exacta de ID
    for (const area of this.areas()) {
      if (Number(area.id) === areaIdNum) {
        return area.name;
      }
    }

    return 'Sin área';
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
    return estimatedHoursMap[estimatedHours] || estimatedHours || 'No especificado';
  }

  /**
   * Manejo de paginación: siguiente página
   */
  nextPage(): void {
    const totalPages = Math.ceil(this.filteredVolunteers().length / this.formsPerPage());
    if (this.currentPage() < totalPages) {
      this.currentPage.update(page => page + 1);
    }
  }

  /**
   * Manejo de paginación: página anterior
   */
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  /**
   * Retorna el número total de páginas
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredVolunteers().length / this.formsPerPage());
  }

  /**
   * Reintenta cargar los voluntarios
   */
  retryLoading(): void {
    this.loadVolunteers();
  }

  /**
   * Limpia los filtros
   */
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedArea.set('');
    this.filterForms();
    this.notificationService.showInfo('Filtros limpiados');
  }
}
