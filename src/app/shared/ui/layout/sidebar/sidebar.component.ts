import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { name: 'Banner', path: '/admin-panel/banner-upload', icon: 'fa-solid fa-house' },
    { name: 'Boletines', path: '/admin-panel/file-upload', icon: 'fa-solid fa-book-open' },
    { name: 'Música', path: '/admin-panel/spotify-control', icon: 'fa-solid fa-music' },
    { name: 'Nosotros', path: '/admin-panel/about-us-control', icon: 'fa-solid fa-users' }
  ];
}
