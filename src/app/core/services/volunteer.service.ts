import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../core/environment';
import { VolunteerPending } from '../interfaces/volunteer';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/volunteers`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Intento de acceder a localStorage en un entorno no compatible.');
      return new HttpHeaders();
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No autenticado: token no encontrado.');
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** Obtener todos los formularios de voluntariado */
  getPendingVolunteers(): Observable<VolunteerPending[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }

    return this.http.get<VolunteerPending[]>(
      `${this.apiUrl}/pending`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error al obtener voluntarios pendientes', error);
        return throwError(() => new Error('Error al obtener voluntarios pendientes'));
      })
    );
  }

  /** Obtener un voluntario por su ID */
  getVolunteerById(id: number): Observable<VolunteerPending> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }

    return this.http.get<VolunteerPending>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener detalles del voluntario', error);
        return throwError(() => new Error('Error al obtener detalles del voluntario'));
      })
    );
  }

  /** Aprobar voluntario */
  validateVolunteer(userId: number, approved: boolean): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }

    return this.http.put(
      `${this.apiUrl}/validate`,
      { userId, approved },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error al validar voluntario', error);
        return throwError(() => new Error('Error al validar voluntario'));
      })
    );
  }
}
