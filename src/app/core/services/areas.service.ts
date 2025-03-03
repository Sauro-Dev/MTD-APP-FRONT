import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '../environment';
import { ListArea } from '../interfaces/ListArea';
import { isPlatformBrowser } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RegisterArea {
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreasService {
  private apiUrl = `${environment.apiUrl}/areas`;

  // Datos de fallback para SSR o fallos API
  private defaultAreas: ListArea[] = [
    { id: 1, name: 'Webaso', color: '#FF0000' },
    { id: 2, name: 'Marketing', color: '#00FF00' },
    { id: 3, name: 'Diseño', color: '#0000FF' }
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService
  ) {}

  /**
   * Obtiene headers con autorización
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Obtener todas las áreas con soporte SSR
   */
  getAllAreas(): Observable<ListArea[]> {
    // En SSR devolvemos áreas por defecto
    if (!isPlatformBrowser(this.platformId)) {
      return of(this.defaultAreas);
    }

    return this.http.get<ListArea[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener áreas', error);
        // Devolver áreas por defecto en caso de error
        return of(this.defaultAreas);
      })
    );
  }

  /** Registrar una nueva área */
  registerArea(area: RegisterArea): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ success: false, message: 'No se puede registrar área en SSR' });
    }

    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'No autenticado' });
    }

    return this.http.post(`${this.apiUrl}/register`, area, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al registrar área', error);
        return throwError(() => new Error('Error al registrar área'));
      })
    );
  }
}
