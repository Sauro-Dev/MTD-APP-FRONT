import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  standalone: true,
  imports: [RouterModule, NgOptimizedImage],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {}
