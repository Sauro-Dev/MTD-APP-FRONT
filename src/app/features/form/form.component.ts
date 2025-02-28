import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- IMPORTAR RouterModule

@Component({
  selector: 'app-form',
  standalone: true, // <--- IMPORTANTE: MARCARLO COMO STANDALONE
  imports: [CommonModule, RouterModule], // <-- AÑADIR RouterModule
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent { }
