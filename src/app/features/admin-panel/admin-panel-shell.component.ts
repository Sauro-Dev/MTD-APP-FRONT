// features/admin-panel/admin-panel-shell.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent} from '../../layouts/navbar/navbar.component';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  selector: 'app-admin-panel-shell',
  template: `
    <app-navbar></app-navbar>
    <div class="content-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .content-container {
      margin-top: 70px; /* Ajusta este valor según la altura de la navbar */
      padding: 20px;
    }
  `]
})
export class AdminPanelShellComponent {}
