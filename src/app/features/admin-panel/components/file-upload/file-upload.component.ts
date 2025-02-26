import { Component, OnInit } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { LandingFileService } from '../../../../core/services/landing-file-service';
import { NgClass, NgForOf, NgIf, SlicePipe } from '@angular/common';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  imports: [NgClass, NgForOf, NgIf, SlicePipe],
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
        .map(file => ({
          ...file,
          displayName: file.fileName.includes('_')
            ? file.fileName.split('_').slice(1).join('_')
            : file.fileName
        }));

      // Para la sección de MAGAZINE
      this.uploadedMagazinesFiles = files
        .filter(file => file.fileSector === 'MAGAZINE')
        .map(file => ({
          ...file,
          displayName: file.fileName.includes('_')
            ? file.fileName.split('_').slice(1).join('_')
            : file.fileName
        }));
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
      // Descarga individual
      this.downloadFile(this.selectedFiles[0]);
      this.closeAllFilesModal();
    } else {
      // Descarga múltiple: genera un ZIP
      const zip = new JSZip();
      const fileRequests = this.selectedFiles.map(file => {
        const fileId = file.idLandingFiles || (file as any).id;
        if (!fileId) {
          console.error('No se encontró el ID del archivo:', file);
          return Promise.resolve();
        }
        return new Promise<void>((resolve, reject) => {
          this.landingFileService.getFileById(fileId).subscribe({
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
            .then((content: string | Blob) => {
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
    const fileId = file.idLandingFiles || (file as any).id;
    if (!fileId) {
      console.error('No se encontró el ID del archivo:', file);
      alert('Error: no se encontró el ID del archivo.');
      return;
    }
    this.landingFileService.getFileById(fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.displayName || file.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando archivo:', err);
        alert('Error al descargar el archivo.');
      }
<<<<<<< Updated upstream
    }, () => {
      alert('Error al subir el archivo.');
=======
>>>>>>> Stashed changes
    });
  }
}
