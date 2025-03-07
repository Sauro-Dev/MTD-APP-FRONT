import { Component, OnInit } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { LandingFileService } from '../../../../core/services/landing-file.service';
import { NgClass, NgForOf, NgIf, SlicePipe } from '@angular/common';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

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

  showAllFilesModal = false;
  selectedFiles: LandingFile[] = [];

  showModal = false;
  modalMessage = '';
  isClosing = false;
  currentSector: 'news' | 'magazine' = 'news';

  // Listas de archivos subidos filtradas por sector
  uploadedNewsFiles: LandingFile[] = [];
  uploadedMagazinesFiles: LandingFile[] = [];

  // Indicadores de drag & drop
  draggingNews = false;
  draggingMagazine = false;

  // Email del administrador autenticado
  adminEmail: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private landingFileService: LandingFileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener email del usuario/admin
    this.authService.getUserDetails().then(userDetails => {
      if (userDetails && userDetails.email) {
        this.adminEmail = userDetails.email;
        this.fetchUploadedFiles();
      } else {
        console.error('No se pudo obtener el email del usuario');
        this.errorMessage = 'Error de autenticación. Por favor, inicia sesión de nuevo.';
      }
    }).catch(error => {
      console.error('Error al obtener detalles del usuario:', error);
      this.errorMessage = 'Error al verificar tu sesión. Por favor, inicia sesión de nuevo.';
    });
  }

  /**
   * Valida la extensión del archivo para asegurar que es un PDF
   */
  private validatePdfExtension(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf') {
      this.showErrorModal('Solo se permiten archivos PDF. Verifica la extensión del archivo.');
      return false;
    }
    return true;
  }

  /**
   * Valida el tamaño del archivo (máx 5MB)
   */
  private validateFileSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showErrorModal('El archivo no puede superar los 5MB');
      return false;
    }
    return true;
  }

  fetchUploadedFiles(): void {
    this.isLoading = true;
    this.landingFileService.getAllFiles().subscribe({
      next: (files) => {
        this.processFilesForDisplay(files);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar archivos:', err);
        this.errorMessage = 'Error al cargar los archivos. Verifica tu conexión.';
        this.isLoading = false;
      }
    });
  }

  // Extraer método para procesar archivos y evitar duplicación de código
  private processFilesForDisplay(files: LandingFile[]): void {
    // Función para procesar un archivo individual
    const processFile = (file: LandingFile): LandingFile => {
      let key = file.fileName;
      if (key.startsWith('http')) {
        try {
          const url = new URL(key);
          key = url.pathname;
          if (key.startsWith('/')) {
            key = key.substring(1);
          }
        } catch (e) {
          // Capturar error silenciosamente
        }
      }
      let displayName = key.includes('_') ? key.split('_').slice(1).join('_') : key;
      displayName = decodeURIComponent(displayName);
      return {
        ...file,
        displayName: displayName
      };
    };

    // Filtrar y procesar archivos por sector
    this.uploadedNewsFiles = files
      .filter(file => file.fileSector === 'NEWS')
      .map(processFile);

    this.uploadedMagazinesFiles = files
      .filter(file => file.fileSector === 'MAGAZINE')
      .map(processFile);
  }

  uploadFile(type: 'news' | 'magazine'): void {
    const fileToUpload = type === 'news' ? this.selectedNewsFile : this.selectedMagazineFile;

    if (!fileToUpload) {
      this.showErrorModal('Por favor, selecciona un archivo.');
      return;
    }

    if (!this.adminEmail) {
      this.showErrorModal('Error de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    const fileSector = (type === 'news') ? 'NEWS' : 'MAGAZINE';
    this.isLoading = true;

    this.landingFileService.uploadFile(fileToUpload, this.adminEmail, fileSector).subscribe({
      next: (response) => {
        this.modalMessage = 'Archivo subido exitosamente.';
        this.showModal = true;
        this.fetchUploadedFiles();

        // Limpiar archivo seleccionado
        if (type === 'news') {
          this.selectedNewsFile = null;
        } else {
          this.selectedMagazineFile = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.showErrorModal(err.message || 'Error al subir el archivo. Por favor intenta nuevamente.');
        this.isLoading = false;
      }
    });
  }

  showErrorModal(message: string): void {
    this.modalMessage = message;
    this.showModal = true;
  }

  // Método centralizado para procesar archivos seleccionados
  private processSelectedFile(file: File, type: 'news' | 'magazine'): boolean {
    // Validaciones
    if (!this.validatePdfExtension(file)) return false;
    if (!this.validateFileSize(file)) return false;

    // Asignar archivo según el tipo
    if (type === 'news') {
      this.selectedNewsFile = file;
    } else {
      this.selectedMagazineFile = file;
    }

    return true;
  }

  onFileSelected(event: Event, type: 'news' | 'magazine'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processSelectedFile(input.files[0], type);
    }
  }

  onDragOver(event: DragEvent, type: 'news' | 'magazine'): void {
    event.preventDefault();
    this[type === 'news' ? 'draggingNews' : 'draggingMagazine'] = true;
  }

  onDragLeave(type: 'news' | 'magazine'): void {
    this[type === 'news' ? 'draggingNews' : 'draggingMagazine'] = false;
  }

  onDrop(event: DragEvent, type: 'news' | 'magazine'): void {
    event.preventDefault();
    this[type === 'news' ? 'draggingNews' : 'draggingMagazine'] = false;

    if (!event.dataTransfer?.files.length) return;

    this.processSelectedFile(event.dataTransfer.files[0], type);
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
      this.showErrorModal('No se ha seleccionado ningún archivo.');
      return;
    }

    if (this.selectedFiles.length === 1) {
      this.downloadFile(this.selectedFiles[0]);
      this.closeAllFilesModal();
      return;
    }

    // Descarga múltiple: generar un ZIP
    this.downloadMultipleFiles();
  }

  // Extraído para evitar duplicación
  private downloadMultipleFiles(): void {
    const zip = new JSZip();
    const fileRequests = this.selectedFiles.map(file => {
      return new Promise<void>((resolve, reject) => {
        this.landingFileService.downloadFileById(file.idLandingFiles).subscribe({
          next: (blob) => {
            zip.file(file.displayName || file.fileName, blob);
            resolve();
          },
          error: () => {
            reject(new Error(`Error al descargar archivo: ${file.displayName || file.fileName}`));
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
      .catch(() => {
        this.showErrorModal('Error al generar el archivo comprimido.');
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
        saveAs(blob, file.displayName || 'archivo.pdf');
      },
      error: () => {
        this.showErrorModal('Error al descargar el archivo.');
      }
    });
  }
}
