import { Component } from '@angular/core';
import {RegisterAreaComponent} from './register-area/register-area.component';
import {CommonModule, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  imports: [
    RegisterAreaComponent,
    NgIf,
    NgForOf, CommonModule
  ],
  styleUrls: ['./areas.component.css']
})
export class AreasComponent {
  areas = [{ name: 'Marketing' }];
  showRegisterModal = false;
  showSuccessModal = false;

  openRegisterModal() {
    this.showRegisterModal = true;
  }

  closeRegisterModal(confirmed: boolean) {
    this.showRegisterModal = false;
    if (confirmed) {
      this.showSuccessModal = true;
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
