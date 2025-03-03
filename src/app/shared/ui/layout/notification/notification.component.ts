import {Component, OnInit} from '@angular/core';
import {NotificationService} from '../../../../core/services/notification.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notification = {
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    message: '',
    show: false
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notification$.subscribe(notification => {
      this.notification = notification;
    });
  }

  closeNotification(): void {
    this.notificationService.hideNotification();
  }
}
