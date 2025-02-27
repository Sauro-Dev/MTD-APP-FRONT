import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LandingFileService} from '../../../../core/services/landing-file-service';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {LandingFile} from '../../../../core/interfaces/landing-file';

@Component({
    selector: 'app-banner',
    imports: [
      NgOptimizedImage,
      NgIf
    ],
    templateUrl: './banner.component.html',
    styleUrl: './banner.component.css'
  })
  export class BannerComponent implements OnInit {
    banners: (LandingFile & { safeUrl: SafeUrl })[] = [];
    currentIndex = 0;
    selectedFile?: File;
    previewImage?: SafeUrl;
    adminId = 1;
    fileSector = 'BANNER';

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(private landingFileService: LandingFileService,
                private sanitizer: DomSanitizer) {}

    ngOnInit() {
      this.loadBanners();
    }

    loadBanners() {
      this.landingFileService.getAllFiles().subscribe((files) => {
        this.banners = files
          .filter(file => file.fileSector === 'BANNER')
          .map(file => ({
            ...file,
            safeUrl: this.sanitizeUrl(file.fileName)
          }));

        if (this.banners.length > 0) {
          this.currentIndex = 0;
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

      const bannerToDelete = this.banners[this.currentIndex];
      this.landingFileService.disableFile(bannerToDelete.idLandingFiles).subscribe(() => {
        this.banners.splice(this.currentIndex, 1);
        if (this.banners.length === 0) {
          this.currentIndex = 0;
        } else {
          this.currentIndex = Math.min(this.currentIndex, this.banners.length - 1);
        }
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
      }
    }

    uploadBanner() {
      if (!this.selectedFile) return;

      this.landingFileService.uploadFile(this.selectedFile, this.adminId, this.fileSector)
        .subscribe((response: LandingFile) => {
          const newBanner = {
            ...response,
            safeUrl: this.sanitizeUrl(response.fileName)
          };

          this.banners.push(newBanner);
          this.selectedFile = undefined;
          this.previewImage = undefined;
        });
    }
  }
