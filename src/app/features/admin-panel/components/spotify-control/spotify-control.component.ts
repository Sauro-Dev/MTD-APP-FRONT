import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SpotifyControlService} from '../../../../core/services/spotify-control.service';
import {ListPlaylist} from '../../../../core/interfaces/list-playlist';
import {RegisterPlaylist} from '../../../../core/interfaces/register-playlist';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-spotify-control',
  imports: [CommonModule, FormsModule],
  templateUrl: './spotify-control.component.html',
  styleUrl: './spotify-control.component.css'
})
export class SpotifyControlComponent implements OnInit, AfterViewInit {

  playlists: ListPlaylist[] = [];
  message: string | null = null;

  // Campos para crear
  newTitle: string = '';
  newEmbedCode: string = '';

  // Control modal de deshabilitacion
  showModal: boolean = false;
  modalMessage: string = '';

  // Flechas de scroll horizontal
  @ViewChild('scrollableContainer', { static: false })
  scrollableContainer!: ElementRef<HTMLDivElement>;
  arrowLeftVisible = false;
  arrowRightVisible = false;

  constructor(
    private spotifyService: SpotifyControlService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit() {
    if (this.scrollableContainer) {
      this.scrollableContainer.nativeElement.addEventListener('scroll', () => {
        this.checkArrows();
      });
    }
  }

  loadAll(): void {
    this.spotifyService.getAll().subscribe({
      next: (arr) => {
        this.playlists = arr;
        if (!arr.length) {
          this.message = 'No se encontraron playlists habilitadas';
        } else {
          this.message = null;
        }
      },
      error: (err) => {
        console.error('Error al obtener playlists:', err);
        this.message = 'No se encontraron playlists habilitadas';
      }
    });
  }

  addPlaylist() {
    if (!this.newTitle.trim() || !this.newEmbedCode.trim()) {
      return;
    }

    const { embedUrl, directUrl } = this.parseSpotifyEmbedCode(this.newEmbedCode);

    if (!embedUrl || !directUrl) {
      console.error('Código de inserción inválido');
      return;
    }

    const dto: RegisterPlaylist = {
      title: this.newTitle,
      embedUrl,
      directUrl
    };

    this.spotifyService.create(dto).subscribe({
      next: (created) => {
        this.newTitle = '';
        this.newEmbedCode = '';
        this.loadAll();
      },
      error: (err) => {
        console.error('Error al crear playlist:', err);
      }
    });
  }

  /**
   * Método privado que busca en el iframeCode un atributo src="..."
   * y retorna un objeto con embedUrl y directUrl.
   */
  private parseSpotifyEmbedCode(iframeCode: string): { embedUrl: string; directUrl: string } {
    // Expresión regular para capturar el valor de src="..."
    const srcRegex = /src\s*=\s*"([^"]+)"/i;
    const match = iframeCode.match(srcRegex);

    let embedUrl = '';
    let directUrl = '';

    if (match && match[1]) {
      // La URL embebida es la que está en src
      embedUrl = match[1];
      // Generamos la URL directa reemplazando '/embed/' por '/'
      directUrl = embedUrl.replace('/embed/', '/');
    }

    return { embedUrl, directUrl };
  }

  disable(pl: ListPlaylist) {
    this.spotifyService.disable(pl.idPlaylist).subscribe({
      next: () => {
        this.showModalMessage('Se ha deshabilitado la playlist correctamente');
        this.loadAll();
      },
      error: (err) => console.error('Error al deshabilitar:', err)
    });
  }

  enable(pl: ListPlaylist) {
    this.spotifyService.enable(pl.idPlaylist).subscribe({
      next: (res) => {
        console.log('Habilitada:', res);
        this.loadAll();
      },
      error: (err) => console.error('Error al habilitar:', err)
    });
  }

  edit(pl: ListPlaylist) {
    console.log('Editar playlist:', pl);
    // Podrías abrir modal o navegar a /admin-panel/spotify-control/edit/:id
  }

  safeEmbed(url: string): SafeResourceUrl {
    // Sanitiza el embedUrl para el iframe
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Muestra el modal de deshabilitación
  private showModalMessage(msg: string) {
    this.modalMessage = msg;
    this.showModal = true;
  }

  // Ocultar modal
  closeModal() {
    this.showModal = false;
  }

  // Métodos de scroll horizontal
  checkArrows() {
    if (!this.scrollableContainer) return;
    const container = this.scrollableContainer.nativeElement;

    // Si scrollLeft > 0, la flecha izquierda debe mostrarse
    this.arrowLeftVisible = container.scrollLeft > 0;

    // Si scrollWidth > clientWidth + scrollLeft, hay más contenido a la derecha
    this.arrowRightVisible =
      container.scrollWidth > container.clientWidth + container.scrollLeft;
  }

  scrollLeft(): void {
    const container = this.scrollableContainer.nativeElement;
    container.scrollBy({ left: -200, behavior: 'smooth' });
    // Espera un poco y revisa si todavía hay overflow
    setTimeout(() => this.checkArrows(), 300);
  }

  scrollRight(): void {
    const container = this.scrollableContainer.nativeElement;
    container.scrollBy({ left: 200, behavior: 'smooth' });
    setTimeout(() => this.checkArrows(), 300);
  }
}
