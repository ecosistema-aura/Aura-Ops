import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Minimalist Header & Filters in Aura Navy -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
            <h2 class="text-2xl font-bold text-white tracking-tight">Gestión de Tareas</h2>
          </div>
          <p class="text-sm text-slate-400 mt-1">Listado operativo de asignaciones, estados y plazos de entrega.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Quick Filter Status -->
          <select 
            [(ngModel)]="filterStatus" 
            class="text-sm px-3 py-2 rounded-lg border border-[#1E3756] bg-[#112238] text-slate-200 focus:outline-none focus:border-sky-400 font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En curso</option>
            <option value="in_review">En revisión</option>
            <option value="completed">Completada</option>
            <option value="blocked">Bloqueada</option>
          </select>

          <!-- Search -->
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar tarea..."
            class="text-sm px-3 py-2 rounded-lg border border-[#1E3756] bg-[#112238] text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 w-44 sm:w-56"
          />

          <button 
            type="button"
            (click)="onNewTask.emit()"
            class="text-sm px-4 py-2 bg-white text-[#0B192C] font-semibold hover:bg-slate-100 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span class="text-[#E11D48] font-bold">+</span>
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      <!-- Clean Minimal Table in Aura Navy -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden shadow-xs">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[#1E3756] text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th class="py-3.5 px-5 font-semibold">Código</th>
              <th class="py-3.5 px-5 font-semibold">Título & Descripción</th>
              <th class="py-3.5 px-5 font-semibold">Responsable</th>
              <th class="py-3.5 px-5 font-semibold">Estado</th>
              <th class="py-3.5 px-5 font-semibold">Plazo</th>
              <th class="py-3.5 px-5 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1E3756]/60 text-sm">
            @for (task of filteredTasks; track task.id) {
              <tr class="hover:bg-[#152B44]/80 transition-colors">
                <td class="py-4 px-5 font-mono text-xs font-bold text-sky-400 whitespace-nowrap">{{ task.code }}</td>
                <td class="py-4 px-5">
                  <div class="font-medium text-white">{{ task.title }}</div>
                  @if (task.description) {
                    <div class="text-xs text-slate-400 truncate max-w-lg mt-0.5">{{ task.description }}</div>
                  }
                </td>
                <td class="py-4 px-5 text-slate-300 whitespace-nowrap font-medium">{{ task.assignee?.name || '—' }}</td>
                <td class="py-4 px-5 whitespace-nowrap">
                  <select 
                    [ngModel]="task.status" 
                    (ngModelChange)="onStatusChange(task.id, $event)"
                    class="text-xs font-medium py-1 px-2.5 rounded-md border border-[#1E3756] bg-[#0B192C] text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En curso</option>
                    <option value="in_review">Revisión</option>
                    <option value="completed">Completada</option>
                    <option value="blocked">Bloqueada</option>
                  </select>
                </td>
                <td class="py-4 px-5 whitespace-nowrap text-xs font-mono" [ngClass]="isOverdue(task.dueDate, task.status) ? 'text-[#FB7185] font-semibold' : 'text-slate-300'">
                  {{ task.dueDate }}
                </td>
                <td class="py-4 px-5 text-right whitespace-nowrap">
                  <button 
                    type="button" 
                    (click)="deleteTask(task)"
                    class="text-slate-500 hover:text-[#FB7185] p-1.5 rounded transition-colors text-base"
                    title="Eliminar"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-12 text-center text-sm text-slate-400">No hay tareas que mostrar</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TasksComponent {
  @Output() onNewTask = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  searchQuery = '';
  filterStatus = 'all';

  get filteredTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(task => {
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matches = 
          task.title.toLowerCase().includes(q) ||
          task.code.toLowerCase().includes(q) ||
          (task.assignee?.name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (this.filterStatus !== 'all' && task.status !== this.filterStatus) {
        return false;
      }

      return true;
    });
  }

  isOverdue(dueDate: string, status: TaskStatus): boolean {
    if (status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  onStatusChange(taskId: string, newStatus: TaskStatus): void {
    this.opsService.updateTaskStatus(taskId, newStatus);
    this.notificationService.info('Actualizado', `Estado modificado a ${newStatus}`);
  }

  deleteTask(task: Task): void {
    if (confirm(`¿Eliminar ${task.code}?`)) {
      this.opsService.deleteTask(task.id);
      this.notificationService.warning('Eliminado', task.code);
    }
  }
}
