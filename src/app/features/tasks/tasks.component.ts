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
    <div class="space-y-4 max-w-5xl">
      <!-- Minimalist Header & Filters in Aura Navy -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 class="text-base font-semibold text-white tracking-tight">Tareas</h2>
          <p class="text-xs text-slate-400">Listado general de operaciones y asignaciones.</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Quick Filter Status -->
          <select 
            [(ngModel)]="filterStatus" 
            class="text-xs px-2.5 py-1.5 rounded border border-[#1E3756] bg-[#112238] text-slate-200 focus:outline-none focus:border-sky-400"
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
            placeholder="Buscar..."
            class="text-xs px-2.5 py-1.5 rounded border border-[#1E3756] bg-[#112238] text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 w-36 sm:w-48"
          />

          <button 
            type="button"
            (click)="onNewTask.emit()"
            class="text-xs px-3 py-1.5 bg-white text-[#0B192C] font-semibold hover:bg-slate-100 rounded shadow-xs transition-colors"
          >
            + Nueva
          </button>
        </div>
      </div>

      <!-- Clean Minimal Table in Aura Navy -->
      <div class="bg-[#112238] rounded-lg border border-[#1E3756] overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-[#1E3756] text-slate-400 font-medium text-[11px]">
              <th class="py-2.5 px-4 font-normal">Código</th>
              <th class="py-2.5 px-4 font-normal">Título</th>
              <th class="py-2.5 px-4 font-normal">Responsable</th>
              <th class="py-2.5 px-4 font-normal">Estado</th>
              <th class="py-2.5 px-4 font-normal">Plazo</th>
              <th class="py-2.5 px-4 font-normal text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1E3756]/60">
            @for (task of filteredTasks; track task.id) {
              <tr class="hover:bg-[#152B44]/80 transition-colors">
                <td class="py-3 px-4 font-mono text-[11px] text-sky-400">{{ task.code }}</td>
                <td class="py-3 px-4">
                  <div class="font-medium text-white">{{ task.title }}</div>
                  @if (task.description) {
                    <div class="text-[11px] text-slate-400 truncate max-w-md mt-0.5">{{ task.description }}</div>
                  }
                </td>
                <td class="py-3 px-4 text-slate-300 whitespace-nowrap">{{ task.assignee?.name || '—' }}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <select 
                    [ngModel]="task.status" 
                    (ngModelChange)="onStatusChange(task.id, $event)"
                    class="text-[11px] py-0.5 px-1.5 rounded border border-[#1E3756] bg-[#0B192C] text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En curso</option>
                    <option value="in_review">Revisión</option>
                    <option value="completed">Completada</option>
                    <option value="blocked">Bloqueada</option>
                  </select>
                </td>
                <td class="py-3 px-4 whitespace-nowrap text-[11px]" [ngClass]="isOverdue(task.dueDate, task.status) ? 'text-rose-400 font-medium' : 'text-slate-400'">
                  {{ task.dueDate }}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <button 
                    type="button" 
                    (click)="deleteTask(task)"
                    class="text-slate-500 hover:text-rose-400 p-1"
                    title="Eliminar"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-8 text-center text-xs text-slate-400">No hay tareas que mostrar</td>
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
