import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import {ListArea} from '../interfaces/ListArea';

export interface RegisterArea {
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreasService {
  private apiUrl = `${environment.apiUrl}/areas`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** ✅ Obtener todas las áreas */
  getAllAreas(): Observable<ListArea[]> {
    return this.http.get<ListArea[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Registrar una nueva área */
  registerArea(area: RegisterArea): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, area, { headers: this.getAuthHeaders() });
  }

  /** ✅ Editar un área existente */
  updateArea(id: number, area: RegisterArea): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, area, { headers: this.getAuthHeaders() });
  }

  /** ✅ Eliminar un área */
  deleteArea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }
}
