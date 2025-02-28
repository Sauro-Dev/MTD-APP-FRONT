import { Component, OnInit } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { LandingFileService } from '../../../../core/services/landing-file-service';
import { NgClass, NgForOf, NgIf, SlicePipe } from '@angular/common';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, SlicePipe],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  // Archivos seleccionados para cada sección
  selectedNewsFile: File | null = null;
  selectedMagazineFile: File | null = null;

  showAllFilesModal: boolean = false;
  selectedFiles: LandingFile[] = [];

  showModal: boolean = false;
  modalMessage: string = '';
  isClosing: boolean = false;
  currentSector: 'news' | 'magazine' = 'news';

  // Listas de archivos subidos filtradas por sector
  uploadedNewsFiles: LandingFile[] = [];
  uploadedMagazinesFiles: LandingFile[] = [];

  // Indicadores de drag & drop
  draggingNews: boolean = false;
  draggingMagazine: boolean = false;

  constructor(private landingFileService: LandingFileService) { }

  ngOnInit(): void {
    this.fetchUploadedFiles();
  }

  fetchUploadedFiles(): void {
    this.landingFileService.getAllFiles().subscribe(files => {
      // Para la sección de NEWS
      this.uploadedNewsFiles = files
        .filter(file => file.fileSector === 'NEWS')
        .map(file => {
          // Partimos del fileName, que puede ser una URL firmada
          let key = file.fileName;
          if (key.startsWith('http')) {
            try {
              const url = new URL(key);
              key = url.pathname; // Ejemplo: "/1740758337052_CV%20Zahir%20Aredo.pdf"
              if (key.startsWith('/')) {
                key = key.substring(1); // Quita la barra inicial
              }
            } catch (e) {
              // Si falla el parseo, se usa el valor original
            }
          }
          // Removemos el prefijo de timestamp: dividimos por "_" y usamos la parte posterior
          let displayName = key.includes('_') ? key.split('_').slice(1).join('_') : key;
          // Decodificamos para convertir "%20" en espacios, etc.
          displayName = decodeURIComponent(displayName);
          return {
            ...file,
            displayName: displayName
          };
        });

      // Para la sección de MAGAZINE (mismo proceso)
      this.uploadedMagazinesFiles = files
        .filter(file => file.fileSector === 'MAGAZINE')
        .map(file => {
          let key = file.fileName;
          if (key.startsWith('http')) {
            try {
              const url = new URL(key);
              key = url.pathname;
              if (key.startsWith('/')) {
                key = key.substring(1);
              }
            } catch (e) {}
          }
          let displayName = key.includes('_') ? key.split('_').slice(1).join('_') : key;
          displayName = decodeURIComponent(displayName);
          return {
            ...file,
            displayName: displayName
          };
        });
    });
  }


  openAllFilesModal(sector: 'news' | 'magazine'): void {
    this.currentSector = sector;
    this.showAllFilesModal = true;
    this.selectedFiles = [];
  }

  closeAllFilesModal(): void {
    this.showAllFilesModal = false;
  }

  isSelected(file: LandingFile): boolean {
    return this.selectedFiles.some(f => f.idLandingFiles === file.idLandingFiles);
  }

  toggleFileSelection(file: LandingFile): void {
    if (this.isSelected(file)) {
      this.selectedFiles = this.selectedFiles.filter(f => f.idLandingFiles !== file.idLandingFiles);
    } else {
      this.selectedFiles.push(file);
    }
  }

  downloadSelectedFiles(): void {
    if (this.selectedFiles.length === 0) {
      alert('No se ha seleccionado ningún archivo.');
      return;
    }

    if (this.selectedFiles.length === 1) {
      // Para descarga individual, se puede seguir usando window.open o bien usar el endpoint de descarga
      this.downloadFile(this.selectedFiles[0]);
      this.closeAllFilesModal();
    } else {
      // Descarga múltiple: generar un ZIP con los blobs reales de los PDFs
      const zip = new JSZip();
      const fileRequests = this.selectedFiles.map(file => {
        return new Promise<void>((resolve, reject) => {
          this.landingFileService.downloadFileById(file.idLandingFiles).subscribe({
            next: (blob) => {
              zip.file(file.displayName || file.fileName, blob);
              resolve();
            },
            error: (err) => {
              console.error('Error descargando archivo:', err);
              reject(err);
            }
          });
        });
      });

      Promise.all(fileRequests)
        .then(() => {
          zip.generateAsync({ type: 'blob' })
            .then((content: Blob) => {
              saveAs(content, 'archivos_comprimidos.zip');
              this.closeAllFilesModal();
            });
        })
        .catch(error => {
          alert('Error al generar el archivo comprimido.');
        });
    }
  }



  onFileSelected(event: any, type: 'news' | 'magazine'): void {
    const file = event.target.files[0];
    if (file) {
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

  onDragOver(event: DragEvent, type: 'news' | 'magazine'): void {
    event.preventDefault();
    if (type === 'news') {
      this.draggingNews = true;
    } else {
      this.draggingMagazine = true;
    }
  }

  onDragLeave(type: 'news' | 'magazine'): void {
    if (type === 'news') {
      this.draggingNews = false;
    } else {
      this.draggingMagazine = false;
    }
  }

  onDrop(event: DragEvent, type: 'news' | 'magazine'): void {
    event.preventDefault();
    if (type === 'news') {
      this.draggingNews = false;
    } else {
      this.draggingMagazine = false;
    }
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
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

  uploadFile(type: 'news' | 'magazine'): void {
    const fileToUpload = type === 'news' ? this.selectedNewsFile : this.selectedMagazineFile;
    if (!fileToUpload) {
      alert('Por favor, selecciona un archivo.');
      return;
    }
    const adminId = 1; // Se debe obtener dinámicamente en un caso real
    const fileSector = (type === 'news') ? 'NEWS' : 'MAGAZINE';
    this.landingFileService.uploadFile(fileToUpload, adminId, fileSector).subscribe({
      next: (res) => {
        this.modalMessage = 'Archivo subido exitosamente.';
        this.showModal = true;
        this.fetchUploadedFiles();
        if (type === 'news') {
          this.selectedNewsFile = null;
        } else {
          this.selectedMagazineFile = null;
        }
      },
      error: (err) => {
        alert('Error al subir el archivo.');
      }
    });
  }

  closeModal(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.showModal = false;
      this.isClosing = false;
    }, 300);
  }

  downloadFile(file: LandingFile): void {
    this.landingFileService.downloadFileById(file.idLandingFiles).subscribe({
      next: (blob) => {
        // Fuerza la descarga usando saveAs
        saveAs(blob, file.displayName || 'archivo.pdf');
      },
      error: (err) => {
        alert('Error al descargar el archivo.');
      }
    });
  }

}
