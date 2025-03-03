import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environment';
import { VolunteerPending } from '../interfaces/volunteer';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

interface ApiResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/volunteers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Obtener todos los formularios de voluntariado con soporte SSR
   */
  getPendingVolunteers(): Observable<VolunteerPending[]> {
    // Si estamos en SSR, devolvemos array vacío
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    // Si no hay token, devolvemos array vacío sin error
    if (!this.authService.isAuthenticated()) {
      console.warn('No autenticado: token no encontrado');
      return of([]);
    }

    return this.http.get<VolunteerPending[] | ApiResponse>(
      `${this.apiUrl}/pending`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        // Si la respuesta es un mensaje (como en 404), devolvemos array vacío
        if ('message' in response) {
          console.info('Info:', response.message);
          return [];
        }
        return response as VolunteerPending[];
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of([]);
        }
        console.error('Error al obtener voluntarios pendientes', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener un voluntario por su ID con soporte SSR
   */
  getVolunteerById(id: number): Observable<VolunteerPending | null> {
    // Si estamos en SSR, devolvemos null
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    // Si no hay token, devolvemos null sin error
    if (!this.authService.isAuthenticated()) {
      console.warn('No autenticado: token no encontrado');
      return of(null);
    }

    return this.http.get<VolunteerPending | ApiResponse>(
      `${this.apiUrl}/pending/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        // Si la respuesta es un mensaje, devolvemos null
        if ('message' in response) {
          console.warn(response.message);
          return null;
        }
        return response;
      }),
      catchError((error: HttpErrorResponse | Error) => {
        // Para cualquier error, incluyendo 404, devolvemos null
        console.error('Error al obtener voluntario:', error);
        return of(null);
      })
    );
  }

  /**
   * Validar un voluntario (aprobar/rechazar) con soporte SSR
   */
  validateVolunteer(userId: number, approved: boolean, adminComments: string = ''): Observable<any> {
    // Si estamos en SSR, devolvemos respuesta de error
    if (!isPlatformBrowser(this.platformId)) {
      return of({ success: false, message: 'No se puede validar voluntario en SSR' });
    }

    // Si no hay token, devolvemos error formateado
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'No autenticado: token no encontrado' });
    }

    const payload = { userId, approved, adminComments };

    // Usar responseType: 'text' para manejar respuestas de texto plano
    return this.http.put(
      `${this.apiUrl}/validate`,
      payload,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'  // Aceptamos texto plano
      }
    ).pipe(
      tap(() => {
      }),
      map(response => {
        // Intentamos parsear JSON, si falla devolvemos objeto con mensaje
        try {
          return JSON.parse(response);
        } catch (e) {
          return {
            message: response || (approved ? 'Voluntario aprobado correctamente' : 'Solicitud rechazada correctamente'),
            success: true
          };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Si el error es 200, podría ser un éxito con error de parsing
        if (error.status === 200) {
          return of({
            message: approved ? 'Voluntario aprobado correctamente' : 'Solicitud rechazada correctamente',
            success: true
          });
        }

        console.error('Error al validar voluntario', error);
        return of({
          success: false,
          message: 'Error al validar voluntario: ' + this.getErrorMessage(error)
        });
      })
    );
  }

  /**
   * Extraer mensaje de error de distintos tipos de respuestas
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return error.error.message;
    } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      return error.error.message;
    } else if (typeof error.error === 'string') {
      return error.error;
    }
    return error.message || 'Error desconocido';
  }
}
