import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LandingFileService } from '../../../../core/services/landing-file.service';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    NgClass,
  ],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})

export class BannerComponent implements OnInit {
  banners: (LandingFile & { safeUrl: SafeUrl })[] = [];
  currentIndex = 0;
  selectedFile?: File;
  previewImage?: SafeUrl;
  adminEmail: string | null = null;
  fileSector = 'BANNER';
  isLoading = false;
  errorMessage: string | null = null;

  // Variable para gestionar el estado del drag & drop
  draggingBanner = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private landingFileService: LandingFileService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el email del usuario autenticado
    this.authService.getUserDetails().then(userDetails => {
      if (userDetails && userDetails.email) {
        this.adminEmail = userDetails.email;
        this.loadBanners();
      } else {
        console.error('No se pudo obtener el email del usuario');
        this.errorMessage = 'Error de autenticación. Por favor, inicia sesión de nuevo.';
      }
    }).catch(error => {
      console.error('Error al obtener detalles del usuario:', error);
      this.errorMessage = 'Error al verificar tu sesión. Por favor, inicia sesión de nuevo.';
    });
  }

  loadBanners() {
    this.isLoading = true;
    this.landingFileService.getAllFiles().subscribe({
      next: (files) => {
        this.banners = files
          .filter(file => file.fileSector === 'BANNER')
          .map(file => {
            const fileUrl = file.fileName.startsWith('http')
              ? file.fileName
              : `https://pub-98b219d2225448e198655a0ecbea1653.r2.dev/${file.fileName}`;

            console.log("[Frontend] Banner loaded:", fileUrl);

            return {
              ...file,
              safeUrl: this.sanitizeUrl(fileUrl)
            };
          });

        if (this.banners.length > 0) {
          this.currentIndex = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Frontend] Error al cargar banners:', err);
        this.errorMessage = 'Error al cargar los banners. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getSafeImageUrl(): SafeUrl {
    return this.banners.length > 0 ? this.banners[this.currentIndex]?.safeUrl ?? '' : '';
  }

  prevBanner() {
    if (this.banners.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    }
  }

  nextBanner() {
    if (this.banners.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    }
  }

  deleteBanner() {
    if (this.banners.length === 0) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este banner?')) return;

    this.isLoading = true;
    const bannerToDelete = this.banners[this.currentIndex];
    this.landingFileService.disableFile(bannerToDelete.idLandingFiles).subscribe({
      next: () => {
        this.banners.splice(this.currentIndex, 1);
        if (this.banners.length === 0) {
          this.currentIndex = 0;
        } else {
          this.currentIndex = Math.min(this.currentIndex, this.banners.length - 1);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al eliminar banner:', err);
        this.errorMessage = 'Error al eliminar el banner. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // Método centralizado para procesar archivos seleccionados
  private processSelectedFile(file: File): boolean {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return false;
    }

    // Validar tamaño del archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen no puede superar los 5MB');
      return false;
    }

    // Crear vista previa temporal
    const tempPreviewUrl = URL.createObjectURL(file);
    this.previewImage = this.sanitizer.bypassSecurityTrustUrl(tempPreviewUrl);

    // Validar aspect ratio 10:3
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const targetRatio = 10 / 3;
      const tolerance = 0.05; // 5% de tolerancia

      if (Math.abs(aspectRatio - targetRatio) > tolerance) {
        alert(`La imagen debe tener una relación de aspecto 10:3.\nTu imagen tiene una relación ${aspectRatio.toFixed(2)} (${img.width}x${img.height}px)`);
        this.selectedFile = undefined;
        this.previewImage = undefined;
        URL.revokeObjectURL(tempPreviewUrl);
      } else {
        // Solo asignar el archivo si pasa la validación
        this.selectedFile = file;
      }
    };

    // Cargar la imagen para validación
    img.src = tempPreviewUrl;

    return true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processSelectedFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.draggingBanner = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.draggingBanner = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.draggingBanner = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processSelectedFile(event.dataTransfer.files[0]);
    }
  }

  uploadBanner() {
    if (!this.selectedFile) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    if (!this.adminEmail) {
      alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.isLoading = true;
    this.landingFileService.uploadFile(this.selectedFile, this.adminEmail, this.fileSector)
      .subscribe({
        next: (response: LandingFile) => {
          const fileUrl = response.fileName.startsWith('http')
            ? response.fileName
            : `https://pub-98b219d2225448e198655a0ecbea1653.r2.dev/${response.fileName}`;

          const newBanner = {
            ...response,
            safeUrl: this.sanitizeUrl(fileUrl) // ✅ Ensure correct URL
          };

          console.log("[Frontend] New banner added:", newBanner);

          this.banners = [...this.banners, newBanner]; // ✅ Force UI re-render
          this.selectedFile = undefined;
          this.previewImage = undefined;

          // Mostrar el nuevo banner
          this.currentIndex = this.banners.length - 1;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al subir banner:', err);
          this.errorMessage = 'Error al subir el banner. Por favor, intenta de nuevo.';
          this.isLoading = false;
        }
      });
  }
}
