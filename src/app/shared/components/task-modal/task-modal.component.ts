import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../core/services/operations.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskCategory, TaskPriority } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs" (click)="close()"></div>
        <div class="relative w-full max-w-md rounded-lg bg-white border border-slate-200 shadow-xl p-5 text-slate-800 text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
            <h3 class="text-sm font-semibold text-slate-900">Nueva Tarea</h3>
            <button type="button" (click)="close()" class="text-slate-400 hover:text-slate-700">&times;</button>
          </div>

          <form (ngSubmit)="saveTask()" class="space-y-3">
            <div>
              <label class="block text-slate-600 mb-1">Título *</label>
              <input 
                type="text" 
                [(ngModel)]="title" 
                name="title" 
                required
                placeholder="ej. Inspección técnica de rutina"
                class="w-full px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label class="block text-slate-600 mb-1">Detalle</label>
              <textarea 
                [(ngModel)]="description" 
                name="description" 
                rows="2"
                placeholder="Observaciones o notas breves..."
                class="w-full px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-600 mb-1">Responsable</label>
                <select [(ngModel)]="assigneeId" name="assigneeId" class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white">
                  @for (user of opsService.users(); track user.id) {
                    <option [value]="user.id">{{ user.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-slate-600 mb-1">Fecha límite *</label>
                <input type="date" [(ngModel)]="dueDate" name="dueDate" required class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-600 mb-1">Prioridad</label>
                <select [(ngModel)]="priority" name="priority" class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-600 mb-1">Categoría</label>
                <select [(ngModel)]="category" name="category" class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white">
                  <option value="Procesos">Procesos</option>
                  <option value="Logística">Logística</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Auditoría">Auditoría</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Documentación">Documentación</option>
                </select>
              </div>
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" (click)="close()" class="px-3 py-1 text-slate-600 hover:bg-slate-50 rounded">Cancelar</button>
              <button type="submit" [disabled]="!title.trim() || !dueDate" class="px-3 py-1 bg-slate-900 text-white rounded disabled:opacity-50">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TaskModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  title = '';
  description = '';
  assigneeId = 'u1';
  category: TaskCategory = 'Procesos';
  priority: TaskPriority = 'medium';
  dueDate = new Date().toISOString().split('T')[0];

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  saveTask(): void {
    if (!this.title.trim() || !this.dueDate) return;

    this.opsService.addTask({
      title: this.title.trim(),
      description: this.description.trim(),
      assigneeId: this.assigneeId,
      reporterId: 'u1',
      status: 'pending',
      priority: this.priority,
      category: this.category,
      dueDate: this.dueDate,
      tags: [this.category],
      checklist: []
    });

    this.notificationService.success('Creada', this.title);
    this.title = '';
    this.description = '';
    this.close();
  }
}
