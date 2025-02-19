// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  // Importamos RouterModule para usar <router-outlet> en el template
  imports: [RouterModule],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
