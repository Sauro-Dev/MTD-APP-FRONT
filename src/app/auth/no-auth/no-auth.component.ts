import { Component } from '@angular/core';

@Component({
  selector: 'app-no-auth',
  templateUrl: './no-auth.component.html',
  styleUrls: ['./no-auth.component.css']
})
export class NoAuthComponent {
  constructor() {}

  redirectToLanding() {
    window.location.href = 'http://localhost:5173';
  }
}
