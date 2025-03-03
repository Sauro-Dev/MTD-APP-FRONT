import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notification = new BehaviorSubject<Notification>({
    type: 'info',
    message: '',
    show: false
  });

  notification$ = this.notification.asObservable();

  constructor() {}

  showSuccess(message: string, timeout: number = 3000): void {
    this.showNotification('success', message, timeout);
  }

  showError(message: string, timeout: number = 3000): void {
    this.showNotification('error', message, timeout);
  }

  showInfo(message: string, timeout: number = 3000): void {
    this.showNotification('info', message, timeout);
  }

  showWarning(message: string, timeout: number = 3000): void {
    this.showNotification('warning', message, timeout);
  }

  private showNotification(type: 'success' | 'error' | 'info' | 'warning', message: string, timeout: number): void {
    this.notification.next({
      type,
      message,
      show: true
    });

    if (timeout > 0) {
      setTimeout(() => {
        this.hideNotification();
      }, timeout);
    }
  }

  hideNotification(): void {
    const current = this.notification.value;
    this.notification.next({
      ...current,
      show: false
    });
  }
}
