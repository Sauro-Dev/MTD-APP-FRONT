import { Component, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolunteerService } from '../../core/services/volunteer.service';
import { AreasService } from '../../core/services/areas.service';
import { VolunteerPending } from '../../core/interfaces/volunteer';
import { ListArea } from '../../core/interfaces/ListArea';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-form-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-detail.component.html',
  styleUrls: ['./form-detail.component.css']
})
export class FormDetailComponent implements OnInit {
  volunteer = signal<VolunteerPending | null>(null);
  areas = signal<ListArea[]>([]);
  showApproval = signal<boolean>(false);
  showRejection = signal<boolean>(false);
  adminComments = '';
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  processingAction = signal<boolean>(false);
  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private volunteerService: VolunteerService,
    private areasService: AreasService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Solo cargar datos en entorno de navegador
    if (this.isBrowser) {
      this.loadAreas();

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (!id) {
          console.error('ID no válido');
          this.error.set('ID de voluntario no válido');
          this.notificationService.showError('ID de voluntario no válido');
          return;
        }
        this.loadVolunteerDetails(Number(id));
      });
    }
  }

  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        this.areas.set(data);
      },
      error: (err) => {
        console.error('Error al obtener áreas', err);
        this.error.set('Error al cargar las áreas');
        this.notificationService.showError('Error al cargar las áreas');
      },
    });
  }

  loadVolunteerDetails(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.volunteerService.getVolunteerById(id).subscribe({
      next: (data) => {
        if (data) {
          // Solo procesar si recibimos datos válidos
          this.processVolunteerData(data);
        } else {
          // Manejar el caso cuando no se encuentra el voluntario
          this.error.set('No se encontró información del voluntario');
          this.notificationService.showError('No se encontró información del voluntario');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al obtener los detalles del voluntario', err);
        const errorMsg = err.message || 'Error al obtener información del voluntario';
        this.error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        this.loading.set(false);
      }
    });
  }

  processVolunteerData(data: VolunteerPending): void {
    // Esperar a que las áreas estén cargadas si es necesario
    if (this.areas().length === 0) {
      setTimeout(() => this.processVolunteerData(data), 100);
      return;
    }

    // Mapeo de horas estimadas
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
    const estimatedHours = estimatedHoursMap[data.estimatedHours] || data.estimatedHours;

    // Buscar el nombre de área por ID
    let areaName = 'Sin área';

    // Utilizar un enfoque más directo para comparar IDs
    if (data.areaId) {
      // Convertir ambos valores a números para asegurar una comparación correcta
      const volunteerId = Number(data.areaId);

      for (const area of this.areas()) {
        const areaId = Number(area.id);

        if (areaId === volunteerId) {
          areaName = area.name;
          break;
        }
      }

      // Si no se encontró, verificar si ya tenemos el nombre
      if (areaName === 'Sin área' && data.areaName) {
        areaName = data.areaName;
      }
    }

    // Asignar al volunteer la data final
    const processedVolunteer = {
      ...data,
      estimatedHours,
      areaName // Agregamos/sobrescribimos areaName como propiedad
    };

    this.volunteer.set(processedVolunteer);
    this.loading.set(false);
  }

  /** Mostrar modal de aprobación */
  showApproveModal(): void {
    this.adminComments = '';
    this.showApproval.set(true);
    this.showRejection.set(false);
  }

  /** Mostrar modal de rechazo */
  showRejectModal(): void {
    this.adminComments = '';
    this.showRejection.set(true);
    this.showApproval.set(false);
  }

  /** Cerrar todos los modales */
  closeModals(): void {
    this.showApproval.set(false);
    this.showRejection.set(false);
    this.adminComments = '';
  }

  /** Validar voluntario (aprobar o rechazar) */
  validateVolunteer(approved: boolean): void {
    if (!this.volunteer() || this.processingAction()) return;

    this.processingAction.set(true);

    this.volunteerService.validateVolunteer(
      this.volunteer()!.userId,
      approved,
      this.adminComments
    ).subscribe({
      next: (response) => {
        this.closeModals();

        let successMessage = '';
        if (typeof response === 'object' && response.message) {
          successMessage = response.message;
        } else {
          successMessage = approved
            ? 'El voluntario ha sido aprobado correctamente.'
            : 'La solicitud ha sido rechazada.';
        }

        // Mostrar notificación en lugar de alert
        this.notificationService.showSuccess(successMessage);

        // Navegar de vuelta a la lista de formularios con un parámetro para indicar actualización
        this.router.navigate(['/form'], {
          queryParams: {
            updated: true,
            action: approved ? 'approved' : 'rejected',
            userId: this.volunteer()?.userId
          }
        });
      },
      error: (err) => {
        console.error('Error al procesar la solicitud', err);

        // Incluso con error, verificamos si la operación se completó (podría ser un error de parsing)
        if (err.message && err.message.includes('Http failure during parsing')) {
          this.closeModals();

          const successMsg = approved
            ? 'El voluntario ha sido aprobado correctamente.'
            : 'La solicitud ha sido rechazada.';

          this.notificationService.showSuccess(successMsg);

          this.router.navigate(['/form'], {
            queryParams: {
              updated: true,
              action: approved ? 'approved' : 'rejected',
              userId: this.volunteer()?.userId
            }
          });
        } else {
          const errorMsg = 'Error al procesar la solicitud: ' + (err.message || 'Error desconocido');
          this.notificationService.showError(errorMsg);
        }

        this.processingAction.set(false);
      },
      complete: () => {
        this.processingAction.set(false);
      }
    });
  }

  /** Volver a la lista */
  goBack(): void {
    this.router.navigate(['/form']);
  }
}
