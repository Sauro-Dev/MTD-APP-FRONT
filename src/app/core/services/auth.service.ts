import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  readTokenFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
    }
  }

  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    return of(!!token);
  }
}
