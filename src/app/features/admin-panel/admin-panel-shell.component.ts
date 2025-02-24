import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/ui/layout/sidebar/sidebar.component';

@Component({
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  selector: 'app-admin-panel-shell',
  template: `
    <div class="flex flex-col h-screen">

      <div class="flex flex-col md:flex-row flex-1">

        <app-sidebar class="md:w-64 w-full"></app-sidebar>

        <div class="flex-1 p-5">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
  `]
})
export class AdminPanelShellComponent {}
