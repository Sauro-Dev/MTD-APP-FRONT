import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Asegurar que HttpClientModule está importado
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  uploadedNewsFiles: any[] = [];
  uploadedMagazinesFiles: any[] = [];
  selectedNewsFile: File | null = null;
  selectedMagazineFile: File | null = null;
  draggingNews = false;
  draggingMagazine = false;

  newsApiUrl = 'http://localhost:8080/api/files'; // Endpoint para Noticias
  magazinesApiUrl = 'http://localhost:8080/api/magazines'; // Endpoint para Revistas

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUploadedFiles();
  }

  fetchUploadedFiles() {
    this.http.get<any[]>(this.newsApiUrl).subscribe(files => {
      this.uploadedNewsFiles = files;
    });

    this.http.get<any[]>(this.magazinesApiUrl).subscribe(files => {
      this.uploadedMagazinesFiles = files;
    });
  }

  // Seleccionar archivo manualmente
  onFileSelected(event: any, type: 'news' | 'magazine') {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (type === 'news') {
        this.selectedNewsFile = file;
      } else {
        this.selectedMagazineFile = file;
      }
    } else {
      alert('Solo se permiten archivos PDF.');
    }
  }

  // Función para manejar Drop (cuando el usuario suelta el archivo dentro del área de arrastrar)
  onDrop(event: DragEvent, type: 'news' | 'magazine') {
    event.preventDefault();
    this.draggingNews = false;
    this.draggingMagazine = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        if (type === 'news') {
          this.selectedNewsFile = file;
        } else {
          this.selectedMagazineFile = file;
        }
      } else {
        alert('Solo se permiten archivos PDF.');
      }
    }
  }

  // Manejo de eventos para cambiar la apariencia del área de arrastrar
  onDragOver(event: DragEvent, type: 'news' | 'magazine') {
    event.preventDefault();
    if (type === 'news') {
      this.draggingNews = true;
    } else {
      this.draggingMagazine = true;
    }
  }

  onDragLeave(type: 'news' | 'magazine') {
    if (type === 'news') {
      this.draggingNews = false;
    } else {
      this.draggingMagazine = false;
    }
  }

  uploadFile(type: 'news' | 'magazine') {
    const selectedFile = type === 'news' ? this.selectedNewsFile : this.selectedMagazineFile;
    const apiUrl = type === 'news' ? this.newsApiUrl : this.magazinesApiUrl;

    if (!selectedFile) {
      alert('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    this.http.post(apiUrl, formData).subscribe(() => {
      alert('Archivo subido exitosamente.');
      this.fetchUploadedFiles();
      if (type === 'news') {
        this.selectedNewsFile = null;
      } else {
        this.selectedMagazineFile = null;
      }
    }, () => {
      alert('Error al subir el archivo.');
    });
  }
}
