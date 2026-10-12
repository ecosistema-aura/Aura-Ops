import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastNotification[]>([]);

  show(type: 'success' | 'info' | 'warning' | 'error', title: string, message: string, durationMs = 3500): void {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast: ToastNotification = { id, type, title, message };
    
    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
