import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environment';
import { ListArea } from '../interfaces/ListArea';
import { isPlatformBrowser } from '@angular/common';
import { catchError } from 'rxjs/operators';

export interface RegisterArea {
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreasService {
  private apiUrl = `${environment.apiUrl}/areas`;

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

  /** Obtener todas las áreas */
  getAllAreas(): Observable<ListArea[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }

    return this.http.get<ListArea[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al obtener áreas', error);
        return throwError(() => new Error('Error al obtener áreas'));
      })
    );
  }

  /** Registrar una nueva área */
  registerArea(area: RegisterArea): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
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

  /** Editar un área existente */
  updateArea(id: number, area: RegisterArea): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }
    return this.http.put(`${this.apiUrl}/update/${id}`, area, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al actualizar área', error);
        return throwError(() => new Error('Error al actualizar área'));
      })
    );
  }

  /** Eliminar un área */
  deleteArea(id: number): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede acceder a localStorage en este entorno.'));
    }
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al eliminar área', error);
        return throwError(() => new Error('Error al eliminar área'));
      })
    );
  }

  /** Método para obtener las áreas públicas */
  getPublicAreas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/all`).pipe(
      catchError(error => {
        console.error('Error al obtener áreas públicas', error);
        return throwError(() => new Error('Error al obtener áreas públicas'));
      })
    );
  }
}
