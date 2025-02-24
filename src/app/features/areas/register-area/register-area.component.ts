import { Component, Output, EventEmitter } from '@angular/core';
import {AreasService} from '../../../core/services/areas.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register-area',
  templateUrl: './register-area.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./register-area.component.css']
})
export class RegisterAreaComponent {
  @Output() closeModal = new EventEmitter<boolean>();
  name: string = '';
  color: string = '#ffffff';

  constructor(private areasService: AreasService) {}

  registerArea() {
    const newArea = { name: this.name, color: this.color };
    this.areasService.registerArea(newArea).subscribe({
      next: () => {
        this.closeModal.emit(true);
      },
      error: () => {
        alert('Error al registrar área.');
        this.closeModal.emit(false);
      }
    });
  }

  cancel() {
    this.closeModal.emit(false);
  }
}
