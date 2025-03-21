import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandingFileService } from '../../../../core/services/landing-file.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-about-us-control',
  imports: [
    FormsModule,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './about-us-control.component.html',
  styleUrl: './about-us-control.component.css'
})
export class AboutUsControlComponent implements OnInit {
  makers: (LandingFile & { safeUrl: SafeUrl })[] = [];
  currentIndex = 0;
  selectedFile?: File;
  previewImage?: SafeUrl;
  makerName = '';
  adminEmail: string | null = null;
  fileSector = 'FEATURED_MAKER';
  description: string = '';
  isLoading = false;

  historyFiles: (LandingFile & { safeUrl: SafeUrl })[] = [];
  historyIndex = 0;
  selectedHistoryFile?: File;
  previewHistoryImage?: SafeUrl;

  teamFiles: (LandingFile & { safeUrl: SafeUrl })[] = [];
  teamIndex = 0;
  selectedTeamFile?: File;
  previewTeamImage?: SafeUrl;


  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('historyFileInput') historyFileInput!: ElementRef;
  @ViewChild('teamFileInput') teamFileInput!: ElementRef;

  constructor(
    private landingFileService: LandingFileService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserDetails().then(userDetails => {
      if (userDetails && userDetails.email) {
        this.adminEmail = userDetails.email;
        this.loadMakers();
        this.loadHistory();
        this.loadTeam();
      } else {
        console.error('No se pudo obtener el email del usuario');
        alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
      }
    }).catch(error => {
      console.error('Error al obtener detalles del usuario:', error);
    });
  }

  get currentMaker() {
    return this.makers.length > 0 ? this.makers[this.currentIndex] : null;
  }

  get currentHistory() {
    return this.historyFiles.length > 0 ? this.historyFiles[this.historyIndex] : null;
  }

  loadMakers() {
    this.isLoading = true;
    this.landingFileService.getAllFiles().subscribe({
      next: (files) => {
        this.makers = files
          .filter((file) => file.fileSector === 'FEATURED_MAKER')
          .map((file) => ({
            ...file,
            safeUrl: this.sanitizeUrl(file.fileName),
          }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar makers:', err);
        this.isLoading = false;
      }
    });
  }

  loadTeam() {
    this.isLoading = true;
    this.landingFileService.getAllFiles().subscribe({
      next: (files) => {
        this.teamFiles = files
          .filter((file) => file.fileSector === 'TEAM')
          .map((file) => ({
            ...file,
            safeUrl: this.sanitizeUrl(file.fileName),
          }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipo:', err);
        this.isLoading = false;
      }
    });
  }


  loadHistory() {
    this.isLoading = true;
    this.landingFileService.getAllFiles().subscribe({
      next: (files) => {
        this.historyFiles = files
          .filter((file) => file.fileSector === 'HISTORY')
          .map((file) => ({
            ...file,
            safeUrl: this.sanitizeUrl(file.fileName),
          }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historia:', err);
        this.isLoading = false;
      }
    });
  }

  getSafeImageUrl(item: LandingFile & { safeUrl: SafeUrl }): SafeUrl {
    return item.safeUrl ?? '';
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  deleteMaker(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este maker?')) return;

    this.landingFileService.disableFile(id).subscribe({
      next: () => {
        this.makers = this.makers.filter((m) => m.idLandingFiles !== id);
        if (this.currentIndex >= this.makers.length && this.makers.length > 0) {
          this.currentIndex = this.makers.length - 1;
        }
      },
      error: (err) => {
        console.error('Error al eliminar maker:', err);
        alert('No se pudo eliminar el maker.');
      }
    });
  }

  deleteHistory(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen de historia?')) return;

    this.landingFileService.disableFile(id).subscribe({
      next: () => {
        this.historyFiles = this.historyFiles.filter((h) => h.idLandingFiles !== id);
        if (this.historyIndex >= this.historyFiles.length && this.historyFiles.length > 0) {
          this.historyIndex = this.historyFiles.length - 1;
        }
      },
      error: (err) => {
        console.error('Error al eliminar historia:', err);
        alert('No se pudo eliminar la imagen de historia.');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(this.selectedFile);
    }
  }

  onHistoryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedHistoryFile = file;
      this.previewHistoryImage = URL.createObjectURL(this.selectedHistoryFile);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(this.selectedFile);
    }
  }

  onHistoryDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onHistoryDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedHistoryFile = file;
      this.previewHistoryImage = URL.createObjectURL(this.selectedHistoryFile);
    }
  }

  uploadTeamMember() {
    if (!this.selectedTeamFile || !this.makerName|| !this.description) {
      alert('Debes completar todos los campos y seleccionar una imagen.');
      return;
    }

    if (!this.adminEmail) {
      alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.isLoading = true;
    this.landingFileService
      .uploadFile(this.selectedTeamFile, this.adminEmail, 'TEAM', this.makerName, this.description)
      .subscribe({
        next: (response: LandingFile) => {
          const fileUrl = response.fileName.startsWith('http')
            ? response.fileName
            : `https://pub-98b219d2225448e198655a0ecbea1653.r2.dev/${response.fileName}`;

          const newMember = {
            ...response,
            safeUrl: this.sanitizeUrl(fileUrl),
          };

          this.teamFiles.push(newMember);
          this.selectedTeamFile = undefined;
          this.previewTeamImage = undefined;
          this.makerName = '';
          this.description = '';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al subir miembro del equipo:', err);
          alert('Error al subir el miembro del equipo.');
          this.isLoading = false;
        },
      });
  }



  uploadMaker() {
    if (!this.selectedFile || this.makers.length >= 10 || !this.makerName || !this.description) {
      alert('Debes completar todos los campos y seleccionar una imagen. Además, no puedes tener más de 10 makers.');
      return;
    }

    if (!this.adminEmail) {
      alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.isLoading = true;
    this.landingFileService.uploadFile(this.selectedFile, this.adminEmail, this.fileSector, this.makerName, this.description)
      .subscribe({
        next: (response: LandingFile) => {
          const fileUrl = response.fileName.startsWith('http')
            ? response.fileName
            : `https://pub-98b219d2225448e198655a0ecbea1653.r2.dev/${response.fileName}`;

          const newMaker = {
            ...response,
            safeUrl: this.sanitizeUrl(fileUrl),
          };

          this.makers = [...this.makers, newMaker];
          this.selectedFile = undefined;
          this.previewImage = undefined;
          this.makerName = '';
          this.description = '';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al subir maker:', err);
          alert('Error al subir el maker. Por favor, intenta de nuevo.');
          this.isLoading = false;
        }
      });
  }

  uploadHistory() {
    if (!this.selectedHistoryFile) {
      alert('Debes seleccionar una imagen');
      return;
    }

    if (!this.adminEmail) {
      alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.isLoading = true;
    this.landingFileService.uploadFile(this.selectedHistoryFile, this.adminEmail, 'HISTORY')
      .subscribe({
        next: (response: LandingFile) => {
          const fileUrl = response.fileName.startsWith('http')
            ? response.fileName
            : `https://pub-98b219d2225448e198655a0ecbea1653.r2.dev/${response.fileName}`;

          const newHistory = {
            ...response,
            safeUrl: this.sanitizeUrl(fileUrl),
          };

          this.historyFiles = [...this.historyFiles, newHistory];
          this.selectedHistoryFile = undefined;
          this.previewHistoryImage = undefined;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al subir historia:', err);
          alert('Error al subir la imagen de historia. Por favor, intenta de nuevo.');
          this.isLoading = false;
        }
      });
  }

  onTeamFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedTeamFile = file;
      this.previewTeamImage = URL.createObjectURL(file);
    }
  }


  get currentTeam() {
    return this.teamFiles.length > 0 ? this.teamFiles[this.teamIndex] : null;
  }

  prevTeam() {
    if (this.teamIndex > 0) {
      this.teamIndex--;
    }
  }

  nextTeam() {
    if (this.teamIndex < this.teamFiles.length - 1) {
      this.teamIndex++;
    }
  }

  deleteTeamMember(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este miembro del equipo?')) return;

    this.landingFileService.disableFile(id).subscribe({
      next: () => {
        this.teamFiles = this.teamFiles.filter((m) => m.idLandingFiles !== id);
        if (this.teamIndex >= this.teamFiles.length && this.teamFiles.length > 0) {
          this.teamIndex = this.teamFiles.length - 1;
        }
      },
      error: (err) => {
        console.error('Error al eliminar miembro del equipo:', err);
        alert('No se pudo eliminar el miembro del equipo.');
      }
    });
  }

  prevMaker() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextMaker() {
    if (this.currentIndex < this.makers.length - 1) {
      this.currentIndex++;
    }
  }

  prevHistory() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
    }
  }

  nextHistory() {
    if (this.historyIndex < this.historyFiles.length - 1) {
      this.historyIndex++;
    }
  }
}
