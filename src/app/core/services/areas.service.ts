import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

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

  registerArea(area: RegisterArea): Observable<any> {
    const token = localStorage.getItem('token'); // Obtiene el token almacenado
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/register`, area, { headers });
  }

  // Metodo para obtener las áreas disponibles
  getPublicAreas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/all`);
  }
}
