import { Component, ElementRef, ViewChild } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandingFileService } from '../../../../core/services/landing-file-service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgOptimizedImage } from '@angular/common';

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
export class AboutUsControlComponent {
  makers: (LandingFile & { safeUrl: SafeUrl })[] = [];
  currentIndex = 0;
  selectedFile?: File;
  previewImage?: SafeUrl;
  makerName = '';
  adminId = 1;
  fileSector = 'FEATURED_MAKER';
  description: string = '';

  // Trayectoria
  historyFiles: (LandingFile & { safeUrl: SafeUrl })[] = [];
  historyIndex = 0;
  selectedHistoryFile?: File;
  previewHistoryImage?: SafeUrl;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('historyFileInput') historyFileInput!: ElementRef;

  constructor(private landingFileService: LandingFileService, private sanitizer: DomSanitizer) {
    this.loadMakers();
    this.loadHistory();
  }

  // Propiedad para acceder al maker actual
  get currentMaker() {
    return this.makers[this.currentIndex];
  }

  // Propiedad para acceder a la trayectoria actual
  get currentHistory() {
    return this.historyFiles[this.historyIndex];
  }

  loadMakers() {
    this.landingFileService.getAllFiles().subscribe((files) => {
      this.makers = files
        .filter((file) => file.fileSector === 'FEATURED_MAKER')
        .map((file) => ({
          ...file,
          safeUrl: this.sanitizeUrl(file.fileName),
        }));
    });
  }

  loadHistory() {
    this.landingFileService.getAllFiles().subscribe((files) => {
      this.historyFiles = files
        .filter((file) => file.fileSector === 'HISTORY')
        .map((file) => ({
          ...file,
          safeUrl: this.sanitizeUrl(file.fileName),
        }));
    });
  }

  getSafeImageUrl(item: LandingFile & { safeUrl: SafeUrl }): SafeUrl {
    return item.safeUrl ?? '';
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  deleteMaker(id: number) {
    this.landingFileService.disableFile(id).subscribe(() => {
      this.makers = this.makers.filter((m) => m.idLandingFiles !== id);
      if (this.currentIndex >= this.makers.length && this.makers.length > 0) {
        this.currentIndex = this.makers.length - 1;
      }
    });
  }

  deleteHistory(id: number) {
    this.landingFileService.disableFile(id).subscribe(() => {
      this.historyFiles = this.historyFiles.filter((h) => h.idLandingFiles !== id);
      if (this.historyIndex >= this.historyFiles.length && this.historyFiles.length > 0) {
        this.historyIndex = this.historyFiles.length - 1;
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
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      this.selectedHistoryFile = file;
      this.previewHistoryImage = URL.createObjectURL(this.selectedHistoryFile);
    }
  }

  uploadMaker() {
    if (!this.selectedFile || this.makers.length >= 10 || !this.makerName || !this.description) return;

    this.landingFileService
      .uploadFile(this.selectedFile, this.adminId, this.fileSector, this.makerName, this.description)
      .subscribe((response: LandingFile) => {
        const newMaker = {
          ...response,
          safeUrl: this.sanitizeUrl(response.fileName),
        };

        this.makers.push(newMaker);
        this.selectedFile = undefined;
        this.previewImage = undefined;
        this.makerName = '';
        this.description = '';
      });
  }

  uploadHistory() {
    if (!this.selectedHistoryFile) return;

    this.landingFileService.uploadFile(this.selectedHistoryFile, this.adminId, 'HISTORY').subscribe((response: LandingFile) => {
      const newHistory = {
        ...response,
        safeUrl: this.sanitizeUrl(response.fileName),
      };

      this.historyFiles.push(newHistory);
      this.selectedHistoryFile = undefined;
      this.previewHistoryImage = undefined;
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
