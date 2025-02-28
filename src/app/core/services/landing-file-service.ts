import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LandingFile } from '../interfaces/landing-file';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class LandingFileService {
  private baseUrl = `${environment.apiUrl}/landing-files`;

  constructor(private http: HttpClient) { }

  uploadFile(file: File, adminId: number, fileSector: string, makerName?: string, description?: string): Observable<LandingFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('adminId', adminId.toString());
    formData.append('fileSector', fileSector);

    if (fileSector === 'FEATURED_MAKER' && makerName && description) {
      formData.append('makerName', makerName);
      formData.append('description', description);
    }

    return this.http.post<LandingFile>(`${this.baseUrl}/register`, formData);
  }

  getFileById(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}`, { responseType: 'blob' });
  }

  getAllFiles(): Observable<LandingFile[]> {
    return this.http.get<LandingFile[]>(`${this.baseUrl}/all`);
  }

  updateFile(id: number, file: File): Observable<LandingFile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<LandingFile>(`${this.baseUrl}/${id}`, formData);
  }

  disableFile(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/disable`, {});
  }
}
