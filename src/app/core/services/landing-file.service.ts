import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LandingFile } from '../interfaces/landing-file';
import { environment } from '../environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LandingFileService {
  private baseUrl = `${environment.apiUrl}/landing-files`;
  private readonly ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Detecta y corrige el tipo MIME de un archivo basado en su extensión
   */
  private detectCorrectMimeType(file: File): File {
    if (this.ALLOWED_TYPES.includes(file.type)) {
      return file;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf' && file.type !== 'application/pdf') {
      return new File([file], file.name, { type: 'application/pdf' });
    }

    if ((extension === 'jpg' || extension === 'jpeg') && !file.type.includes('jpeg')) {
      return new File([file], file.name, { type: 'image/jpeg' });
    }

    if (extension === 'png' && file.type !== 'image/png') {
      return new File([file], file.name, { type: 'image/png' });
    }

    if (extension === 'webp' && file.type !== 'image/webp') {
      return new File([file], file.name, { type: 'image/webp' });
    }

    return file;
  }

  uploadFile(file: File, adminEmail: string, fileSector: string, makerName?: string, description?: string): Observable<LandingFile> {
    // Corregir el tipo MIME si es necesario
    const correctedFile = this.detectCorrectMimeType(file);

    // Validar tipo después de intentar corregirlo
    if (!this.ALLOWED_TYPES.includes(correctedFile.type)) {
      console.error(`[LandingFile] Tipo de archivo no permitido: ${correctedFile.type}`);
      return throwError(() => new Error(`Tipo de archivo no permitido. Solo se aceptan PNG, JPG, WEBP y PDF. Detectado: ${correctedFile.type}`));
    }

    const formData = new FormData();
    formData.append('file', correctedFile);
    formData.append('adminId', '1'); // ID fijo para el backend
    formData.append('fileSector', fileSector);

    if (makerName) {
      formData.append('makerName', makerName);
    }

    if (description) {
      formData.append('description', description);
    }

    // Obtener el token manualmente para asegurar que se envía
    const token = this.authService.getToken();

    // Asegurar que existe un token
    if (!token) {
      console.error('[LandingFile] No hay token de autenticación disponible');
      return throwError(() => new Error('No estás autenticado. Por favor, inicia sesión.'));
    }

    // Configurar opciones con headers explícitos
    const options = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.post<LandingFile>(`${this.baseUrl}/register`, formData, options)
      .pipe(
        tap(response => {
        }),
        catchError(this.handleError)
      );
  }

  getFileById(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/${id}`, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  getAllFiles(): Observable<LandingFile[]> {
    return this.http.get<LandingFile[]>(`${this.baseUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  updateFile(id: number, file: File): Observable<LandingFile> {
    const correctedFile = this.detectCorrectMimeType(file);

    if (!this.ALLOWED_TYPES.includes(correctedFile.type)) {
      return throwError(() => new Error(`Tipo de archivo no permitido. Solo se aceptan PNG, JPG, WEBP y PDF.`));
    }

    const formData = new FormData();
    formData.append('file', correctedFile);

    return this.http.put<LandingFile>(`${this.baseUrl}/update/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  downloadFileById(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${id}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  disableFile(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/disable/${id}`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.status === 0) {
      console.error('[LandingFile] Error de red:', error.error);
      errorMessage = 'Error de conexión. Verifica tu red.';
    } else if (error.status === 400) {
      console.error(`[LandingFile] Error 400 - Bad Request:`, error.error);

      if (error.error && error.error.error === 'Access Denied') {
        errorMessage = 'Acceso denegado. No tienes permisos para realizar esta acción.';
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = 'Formato inválido o datos incorrectos.';
      }
    } else if (error.status === 401) {
      console.error(`[LandingFile] Error 401 - No autorizado:`, error.error);
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 403) {
      console.error(`[LandingFile] Error 403 - Prohibido:`, error.error);
      errorMessage = 'No tienes permisos para realizar esta acción.';
    } else {
      console.error(`[LandingFile] Error ${error.status}:`, error.error);
      errorMessage = `Error del servidor: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
