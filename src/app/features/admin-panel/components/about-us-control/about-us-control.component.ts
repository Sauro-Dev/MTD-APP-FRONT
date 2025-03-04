import { Component, ElementRef, ViewChild } from '@angular/core';
import { LandingFile } from '../../../../core/interfaces/landing-file';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandingFileService } from '../../../../core/services/landing-file-service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-about-us-control',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: 'about-us-control.component.html',
  styleUrl: './about-us-control.component.css'
})
export class AboutUsControlComponent {
  makers: (LandingFile & { safeUrl: SafeUrl })[] = [];
  selectedFile?: File;
  previewImage?: SafeUrl;
  makerName = '';
  adminId = 1;
  fileSector = 'FEATURED_MAKER';
  description: string = '';

  historyFile: (LandingFile & { safeUrl: SafeUrl }) | null = null;
  selectedHistoryFile?: File;
  previewHistoryImage?: SafeUrl;

  @ViewChild('historyFileInput') historyFileInput!: ElementRef;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private landingFileService: LandingFileService,
              private sanitizer: DomSanitizer) {
    this.loadMakers();
    this.loadHistory();
  }


  loadHistory() {
    this.landingFileService.getAllFiles().subscribe((files) => {
      const historyFiles = files.filter(file => file.fileSector === 'HISTORY');
      if (historyFiles.length > 0) {
        this.historyFile = {
          ...historyFiles[0],
          safeUrl: this.sanitizeUrl(historyFiles[0].fileName)
        };
      }
    });
  }


  loadMakers() {
    this.landingFileService.getAllFiles().subscribe((files) => {
      this.makers = files
        .filter(file => file.fileSector === 'FEATURED_MAKER')
        .map(file => ({
          ...file,
          safeUrl: this.sanitizeUrl(file.fileName)
        }));
    });
  }

  getSafeImageUrl(maker: LandingFile & { safeUrl: SafeUrl }): SafeUrl {
    return maker.safeUrl ?? '';
  }


  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  deleteMaker(id: number) {
    this.landingFileService.disableFile(id).subscribe(() => {
      this.makers = this.makers.filter(m => m.idLandingFiles !== id);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewImage = URL.createObjectURL(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.previewImage = URL.createObjectURL(this.selectedFile);
    }
  }

  uploadMaker() {
    if (!this.selectedFile || this.makers.length >= 10 || !this.makerName || !this.description) return;

    this.landingFileService.uploadFile(this.selectedFile, this.adminId, this.fileSector, this.makerName, this.description)
      .subscribe((response: LandingFile) => {
        const newMaker = {
          ...response,
          safeUrl: this.sanitizeUrl(response.fileName)
        };

        this.makers.push(newMaker);
        this.selectedFile = undefined;
        this.previewImage = undefined;
        this.makerName = '';
        this.description = '';
      });
  }

  uploadHistory() {
    // Evitamos subir si ya existe una imagen o no se ha seleccionado ninguna
    if (!this.selectedHistoryFile || this.historyFile) return;

    this.landingFileService.uploadFile(this.selectedHistoryFile, this.adminId, 'HISTORY')
      .subscribe((response: LandingFile) => {
        this.historyFile = {
          ...response,
          safeUrl: this.sanitizeUrl(response.fileName)
        };
        // Reiniciamos las variables de carga
        this.selectedHistoryFile = undefined;
        this.previewHistoryImage = undefined;
      });
  }

  onHistoryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedHistoryFile = input.files[0];
      this.previewHistoryImage = URL.createObjectURL(this.selectedHistoryFile);
    }
  }

  onHistoryDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onHistoryDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedHistoryFile = event.dataTransfer.files[0];
      this.previewHistoryImage = URL.createObjectURL(this.selectedHistoryFile);
    }
  }

}
