import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { ListUser } from '../interfaces/users';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllUsers(): Observable<ListUser[]> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<ListUser[]>(`${this.apiUrl}/all`, { headers });
  }
}
