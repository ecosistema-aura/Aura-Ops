import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../core/services/operations.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskCategory, TaskPriority, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" (click)="close()"></div>

        <!-- Modal Dialog -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 class="text-base font-semibold text-slate-900">Crear Nueva Tarea Operativa</h3>
                <p class="text-xs text-slate-500">Asigna responsables, prioridades, fechas límite y procedimientos.</p>
              </div>
              <button 
                type="button" 
                (click)="close()" 
                class="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form (ngSubmit)="saveTask()" class="mt-4 space-y-4">
              <!-- Título -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Título de la tarea *</label>
                <input 
                  type="text" 
                  [(ngModel)]="title" 
                  name="title" 
                  required
                  placeholder="ej. Mantenimiento de bombas de presión en nave 3"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Descripción y detalles</label>
                <textarea 
                  [(ngModel)]="description" 
                  name="description" 
                  rows="3"
                  placeholder="Instrucciones específicas, especificaciones o requisitos de seguridad..."
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                ></textarea>
              </div>

              <!-- Fila: Asignado a & Categoría -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Responsable asignado *</label>
                  <select 
                    [(ngModel)]="assigneeId" 
                    name="assigneeId"
                    required
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    @for (user of opsService.users(); track user.id) {
                      <option [value]="user.id">{{ user.name }} ({{ user.role }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    [(ngModel)]="category" 
                    name="category"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    <option value="Procesos">Procesos</option>
                    <option value="Logística">Logística</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Auditoría">Auditoría</option>
                    <option value="Soporte">Soporte</option>
                    <option value="Documentación">Documentación</option>
                  </select>
                </div>
              </div>

              <!-- Fila: Prioridad, Fecha Límite, Horas -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Prioridad</label>
                  <select 
                    [(ngModel)]="priority" 
                    name="priority"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Fecha límite *</label>
                  <input 
                    type="date" 
                    [(ngModel)]="dueDate" 
                    name="dueDate" 
                    required
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Horas estimadas</label>
                  <input 
                    type="number" 
                    [(ngModel)]="estimatedHours" 
                    name="estimatedHours" 
                    min="1" 
                    max="100"
                    placeholder="ej. 4"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>
              </div>

              <!-- Proceso asociado opcional -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Asociar a Proceso Interno (opcional)</label>
                <select 
                  [(ngModel)]="processId" 
                  name="processId"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                >
                  <option [ngValue]="undefined">Ninguno / Operación aislada</option>
                  @for (proc of opsService.processes(); track proc.id) {
                    <option [value]="proc.id">{{ proc.code }} - {{ proc.title }}</option>
                  }
                </select>
              </div>

              <!-- Checklist rápido de verificación -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Checklist de verificación inicial</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="newCheckItem" 
                    name="newCheckItem"
                    (keydown.enter)="$event.preventDefault(); addChecklistRow()"
                    placeholder="Añadir punto de chequeo..."
                    class="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button 
                    type="button" 
                    (click)="addChecklistRow()" 
                    class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium"
                  >
                    + Agregar
                  </button>
                </div>
                
                @if (checklist.length > 0) {
                  <ul class="mt-2 space-y-1">
                    @for (item of checklist; track item.id; let idx = $index) {
                      <li class="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md">
                        <span class="text-slate-700">{{ item.text }}</span>
                        <button type="button" (click)="removeChecklistRow(idx)" class="text-rose-500 hover:text-rose-700">
                          &times;
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  (click)="close()" 
                  class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="!title.trim() || !dueDate"
                  class="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
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
  estimatedHours: number | null = 4;
  processId?: string;

  newCheckItem = '';
  checklist: { id: string; text: string; done: boolean }[] = [];

  addChecklistRow(): void {
    if (!this.newCheckItem.trim()) return;
    this.checklist.push({
      id: 'chk_' + Date.now() + Math.random().toString(36).substring(2, 5),
      text: this.newCheckItem.trim(),
      done: false
    });
    this.newCheckItem = '';
  }

  removeChecklistRow(index: number): void {
    this.checklist.splice(index, 1);
  }

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
      estimatedHours: this.estimatedHours || undefined,
      tags: [this.category],
      checklist: this.checklist,
      processId: this.processId || undefined
    });

    this.notificationService.success('Tarea creada', `Se ha registrado la tarea operativa "${this.title}".`);

    // Reset form
    this.title = '';
    this.description = '';
    this.checklist = [];
    this.close();
  }
}
