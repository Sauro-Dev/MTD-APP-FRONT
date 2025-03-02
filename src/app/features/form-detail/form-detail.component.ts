import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolunteerService } from '../../core/services/volunteer.service';
import { AreasService } from '../../core/services/areas.service';
import { VolunteerPending } from '../../core/interfaces/volunteer';
import { ListArea } from '../../core/interfaces/ListArea';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-detail.component.html',
  styleUrls: ['./form-detail.component.css']
})
export class FormDetailComponent implements OnInit {
  volunteer = signal<VolunteerPending | null>(null);
  areas = signal<ListArea[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private volunteerService: VolunteerService,
    private areasService: AreasService
  ) {}

  ngOnInit(): void {
    // Primero cargar las áreas
    this.loadAreas();

    // Luego obtener el id del voluntario
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        console.error('ID no válido');
        this.router.navigate(['/form']);
        return;
      }
      this.loadVolunteerDetails(Number(id));
    });
  }

  loadAreas(): void {
    this.areasService.getAllAreas().subscribe({
      next: (data) => {
        this.areas.set(data);
      },
      error: (err) => console.error('Error al obtener áreas', err),
    });
  }

  loadVolunteerDetails(id: number): void {
    this.volunteerService.getVolunteerById(id).subscribe({
      next: (data) => {
        // Esperar a que las áreas estén cargadas antes de procesar
        const checkAreasLoaded = () => {
          if (this.areas().length === 0) {
            // Si aún no se han cargado las áreas, esperar 100ms e intentarlo de nuevo
            setTimeout(checkAreasLoaded, 100);
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

          // Buscar el nombre de área
          const areaFound = this.areas().find(a => String(a.id) === String(data.areaId));
          const areaName = areaFound ? areaFound.name : 'Sin área';

          // Asegurar país, región
          const country = data.country?.trim() || 'No especificado';
          const region = data.region?.trim() || 'No especificado';

          // Asignar al volunteer la data final
          this.volunteer.set({
            ...data,
            estimatedHours,
            country,
            region,
            areaId: areaName // Sobrescribimos areaId con el nombre para la vista
          });
        };

        checkAreasLoaded();
      },
      error: (err) => {
        console.error('Error al obtener los detalles del voluntario', err);
        alert('No se pudo obtener la información del voluntario.');
        this.router.navigate(['/form']);
      }
    });
  }

  /** Aprobar voluntario */
  verifyVolunteer(): void {
    if (!this.volunteer()) return;

    const confirmAction = confirm('¿Desea verificar y aprobar este voluntario?');
    if (!confirmAction) return;

    this.volunteerService.validateVolunteer(this.volunteer()?.userId!, true)
      .subscribe({
        next: () => {
          alert('El voluntario ha sido aprobado correctamente.');
          this.router.navigate(['/form']);
        },
        error: (err) => {
          console.error('Error al verificar voluntario', err);
          alert('Error al verificar voluntario.');
        }
      });
  }

  /** Volver a la lista */
  goBack(): void {
    this.router.navigate(['/form']);
  }
}
