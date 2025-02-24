import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-auth',
  templateUrl: './no-auth.component.html',
  styleUrls: ['./no-auth.component.css']
})
export class NoAuthComponent {
  constructor(private router: Router) {}

  redirectToLanding() {
    window.location.href = 'http://localhost:5173';
  }
}
