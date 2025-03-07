import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Importante: Asegúrate de que el token incluya "Bearer " si tu backend lo espera así
    const authHeader = `Bearer ${token}`;
    console.log(`[Interceptor] Cabecera Auth: ${authHeader}`);

    const cloned = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });

    return next(cloned).pipe(
      tap({
        next: (event) => {
          console.log(`[Interceptor] Respuesta exitosa: ${req.url}`);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            console.error(`[Interceptor] Error HTTP ${error.status}: ${req.url}`, error);

            if (error.status === 401 || error.status === 403 ||
              (error.status === 400 && error.error?.error === 'Access Denied')) {
              console.warn('[Interceptor] Problema de autenticación o autorización');
              // Si el token está expirado o es inválido, podemos limpiarlo
              // authService.removeToken();
            }
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  // Si no hay token, enviamos la solicitud sin modificar
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[Interceptor] Error sin token: ${error.status}`, error);
      return throwError(() => error);
    })
  );
};
