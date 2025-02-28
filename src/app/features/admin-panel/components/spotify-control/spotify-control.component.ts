import {Component, OnInit} from '@angular/core';
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
export class SpotifyControlComponent implements OnInit {

  playlists: ListPlaylist[] = [];
  message: string | null = null;

  // Campos para crear
  newTitle: string = '';
  newEmbedUrl: string = '';
  newDirectUrl: string = '';

  // Control modal de deshabilitacion
  showModal: boolean = false;
  modalMessage: string = '';

  constructor(
    private spotifyService: SpotifyControlService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadAll();
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
    if (!this.newTitle.trim() || !this.newEmbedUrl.trim() || !this.newDirectUrl.trim()) {
      return;
    }

    const dto: RegisterPlaylist = {
      title: this.newTitle,
      embedUrl: this.newEmbedUrl,
      directUrl: this.newDirectUrl
    };

    this.spotifyService.create(dto).subscribe({
      next: (created) => {
        console.log('Playlist creada:', created);
        this.newTitle = '';
        this.newEmbedUrl = '';
        this.newDirectUrl = '';
        this.loadAll();
      },
      error: (err) => {
        console.error('Error al crear playlist:', err);
      }
    });
  }

  disable(pl: ListPlaylist) {
    this.spotifyService.disable(pl.idPlaylist).subscribe({
      next: (res) => {
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
    // Podrías abrir modal o ruta /admin-panel/spotify-control/edit/:id
  }

  safeEmbed(url: string): SafeResourceUrl {
    // sanitiza el embedUrl para iframe
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Muestra modal deshabilitacion
  private showModalMessage(msg: string) {
    this.modalMessage = msg;
    this.showModal = true;
  }

  // Ocultar modal
  closeModal() {
    this.showModal = false;
  }
}
