import { Injectable } from '@angular/core';
import {environment} from '../environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {RegisterPlaylist} from '../interfaces/register-playlist';
import {Observable} from 'rxjs';
import {ListPlaylist} from '../interfaces/list-playlist';
import {UpdatePlaylist} from '../interfaces/update-playlist';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyControlService {

   private apiUrl = `${environment.apiUrl}/playlists`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** POST /playlists/register -> crea y retorna un ListPlaylist */
  create(dto: RegisterPlaylist): Observable<ListPlaylist> {
    const headers = this.getAuthHeaders();
    return this.http.post<ListPlaylist>(`${this.apiUrl}/register`, dto, { headers });
  }

  /** GET /playlists/all -> retorna un array de ListPlaylist */
  getAll(): Observable<ListPlaylist[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ListPlaylist[]>(`${this.apiUrl}/all`, { headers });
  }

  /** PUT /playlists/update/{id} -> retorna un ListPlaylist */
  update(id: number, dto: UpdatePlaylist): Observable<ListPlaylist> {
    const headers = this.getAuthHeaders();
    return this.http.put<ListPlaylist>(`${this.apiUrl}/update/${id}`, dto, { headers });
  }

  /** PUT /playlists/disable/{id} -> retorna un ListPlaylist */
  disable(id: number): Observable<ListPlaylist> {
    const headers = this.getAuthHeaders();
    return this.http.put<ListPlaylist>(`${this.apiUrl}/disable/${id}`, {}, { headers });
  }

  /** PUT /playlists/enable/{id} -> retorna un ListPlaylist */
  enable(id: number): Observable<ListPlaylist> {
    const headers = this.getAuthHeaders();
    return this.http.put<ListPlaylist>(`${this.apiUrl}/enable/${id}`, {}, { headers });
  }

  /** GET /playlists/disabled -> array de ListPlaylist (o string si vacío) */
  getDisabled(): Observable<ListPlaylist[] | string> {
    const headers = this.getAuthHeaders();
    return this.http.get<ListPlaylist[] | string>(`${this.apiUrl}/disabled`, { headers });
  }
}

