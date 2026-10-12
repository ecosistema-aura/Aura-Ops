import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TaskModalComponent } from './shared/components/task-modal/task-modal.component';
import { RequestModalComponent } from './shared/components/request-modal/request-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    ToastComponent,
    TaskModalComponent,
    RequestModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isTaskModalOpen = false;
  isRequestModalOpen = false;

  openNewTaskModal(): void {
    this.isTaskModalOpen = true;
  }

  openNewRequestModal(): void {
    this.isRequestModalOpen = true;
  }

  onActivateChild(componentRef: any): void {
    // Escuchar eventos onNewTask y onNewRequest emitidos por las vistas hijas
    if (componentRef && componentRef.onNewTask) {
      componentRef.onNewTask.subscribe(() => {
        this.openNewTaskModal();
      });
    }

    if (componentRef && componentRef.onNewRequest) {
      componentRef.onNewRequest.subscribe(() => {
        this.openNewRequestModal();
      });
    }
  }
}
