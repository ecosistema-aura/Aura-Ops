import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  template: `
    <div class="space-y-5">
      <!-- Header & View Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Gestión de Tareas Operativas</h2>
          <p class="text-xs text-slate-500 mt-0.5">Control de asignaciones, avance y cumplimiento de plazos.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Toggle: List / Kanban -->
          <div class="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/60 text-xs">
            <button
              type="button"
              (click)="activeView = 'list'"
              [ngClass]="activeView === 'list' ? 'bg-white text-slate-900 font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Lista</span>
            </button>
            <button
              type="button"
              (click)="activeView = 'kanban'"
              [ngClass]="activeView === 'kanban' ? 'bg-white text-slate-900 font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>Kanban</span>
            </button>
          </div>

          <button 
            type="button"
            (click)="onNewTask.emit()"
            class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-[200px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar por código, título o detalle..."
            class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
          />
        </div>

        <!-- Filter Status -->
        <select 
          [(ngModel)]="filterStatus" 
          class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">Todos los Estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En Curso</option>
          <option value="in_review">En Revisión</option>
          <option value="completed">Completada</option>
          <option value="blocked">Bloqueada</option>
        </select>

        <!-- Filter Priority -->
        <select 
          [(ngModel)]="filterPriority" 
          class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">Todas las Prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        <!-- Filter Assignee -->
        <select 
          [(ngModel)]="filterAssignee" 
          class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">Todos los Responsables</option>
          @for (user of opsService.users(); track user.id) {
            <option [value]="user.id">{{ user.name }}</option>
          }
        </select>

        <!-- Reset Filters -->
        @if (searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all') {
          <button 
            type="button" 
            (click)="resetFilters()"
            class="text-xs text-slate-500 hover:text-slate-800 underline px-1"
          >
            Limpiar filtros
          </button>
        }
      </div>

      <!-- LIST VIEW -->
      @if (activeView === 'list') {
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th class="py-3 px-4">Código & Tarea</th>
                  <th class="py-3 px-3">Responsable</th>
                  <th class="py-3 px-3">Prioridad</th>
                  <th class="py-3 px-3">Estado</th>
                  <th class="py-3 px-3">Fecha Límite</th>
                  <th class="py-3 px-3">Checklist</th>
                  <th class="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (task of filteredTasks; track task.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <!-- Title & Details -->
                    <td class="py-3.5 px-4 max-w-sm">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[10px] font-bold text-slate-500">{{ task.code }}</span>
                        <span class="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">{{ task.category }}</span>
                      </div>
                      <div class="font-semibold text-slate-900 mt-0.5">{{ task.title }}</div>
                      <p class="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{{ task.description }}</p>
                    </td>

                    <!-- Assignee -->
                    <td class="py-3.5 px-3 whitespace-nowrap">
                      @if (task.assignee) {
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold {{ task.assignee.avatarColor }}">
                            {{ task.assignee.initials }}
                          </div>
                          <div>
                            <div class="font-medium text-slate-800 text-[11px]">{{ task.assignee.name }}</div>
                            <div class="text-[10px] text-slate-400">{{ task.assignee.role }}</div>
                          </div>
                        </div>
                      } @else {
                        <span class="text-slate-400 italic">Sin asignar</span>
                      }
                    </td>

                    <!-- Priority -->
                    <td class="py-3.5 px-3 whitespace-nowrap">
                      <app-badge [value]="task.priority"></app-badge>
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-3 whitespace-nowrap">
                      <select 
                        [ngModel]="task.status" 
                        (ngModelChange)="onStatusChange(task.id, $event)"
                        class="text-xs py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Curso</option>
                        <option value="in_review">En Revisión</option>
                        <option value="completed">Completada</option>
                        <option value="blocked">Bloqueada</option>
                      </select>
                    </td>

                    <!-- Due Date -->
                    <td class="py-3.5 px-3 whitespace-nowrap">
                      <div class="text-[11px]" [ngClass]="isOverdue(task.dueDate, task.status) ? 'text-rose-600 font-semibold' : 'text-slate-700'">
                        {{ task.dueDate }}
                      </div>
                      @if (isOverdue(task.dueDate, task.status)) {
                        <span class="text-[9px] uppercase tracking-wider text-rose-600 font-bold">Vencida</span>
                      }
                    </td>

                    <!-- Checklist -->
                    <td class="py-3.5 px-3 whitespace-nowrap">
                      @if (task.checklist && task.checklist.length > 0) {
                        <div class="flex items-center gap-1.5">
                          <span class="text-[11px] text-slate-600 font-mono">
                            {{ getCompletedChecklistCount(task) }}/{{ task.checklist.length }}
                          </span>
                          <div class="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              class="bg-slate-700 h-full rounded-full" 
                              [style.width.%]="(getCompletedChecklistCount(task) / task.checklist.length) * 100"
                            ></div>
                          </div>
                        </div>
                      } @else {
                        <span class="text-slate-400 text-[10px]">—</span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <button 
                        type="button" 
                        (click)="deleteTask(task)"
                        class="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Eliminar tarea"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
                      No se encontraron tareas con los filtros actuales.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- KANBAN VIEW -->
      @if (activeView === 'kanban') {
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <!-- Columna: Pendiente -->
          @for (col of kanbanColumns; track col.status) {
            <div class="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col h-[700px]">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [ngClass]="col.dotClass"></span>
                  <span class="text-xs font-semibold text-slate-800">{{ col.title }}</span>
                </div>
                <span class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {{ getTasksByStatus(col.status).length }}
                </span>
              </div>

              <!-- Cards container -->
              <div class="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                @for (task of getTasksByStatus(col.status); track task.id) {
                  <div class="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                    <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                      <span class="font-mono font-bold">{{ task.code }}</span>
                      <app-badge [value]="task.priority"></app-badge>
                    </div>

                    <h4 class="text-xs font-semibold text-slate-900 leading-snug">{{ task.title }}</h4>
                    <p class="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{{ task.description }}</p>

                    <!-- Checklist items preview -->
                    @if (task.checklist && task.checklist.length > 0) {
                      <div class="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                        @for (chk of task.checklist; track chk.id) {
                          <label class="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                            <input 
                              type="checkbox" 
                              [checked]="chk.done"
                              (change)="opsService.toggleTaskChecklist(task.id, chk.id)"
                              class="rounded border-slate-300 text-slate-900 focus:ring-0"
                            />
                            <span [ngClass]="chk.done ? 'line-through text-slate-400' : ''">{{ chk.text }}</span>
                          </label>
                        }
                      </div>
                    }

                    <!-- Footer of card -->
                    <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div class="flex items-center gap-1.5">
                        @if (task.assignee) {
                          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold {{ task.assignee.avatarColor }}">
                            {{ task.assignee.initials }}
                          </span>
                          <span class="truncate max-w-[80px]">{{ task.assignee.name.split(' ')[0] }}</span>
                        }
                      </div>

                      <span [ngClass]="isOverdue(task.dueDate, task.status) ? 'text-rose-600 font-semibold' : 'text-slate-500'">
                        {{ task.dueDate }}
                      </span>
                    </div>

                    <!-- Fast move buttons -->
                    <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <select 
                        [ngModel]="task.status" 
                        (ngModelChange)="onStatusChange(task.id, $event)"
                        class="w-full text-[10px] py-0.5 px-1 rounded border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none"
                      >
                        <option value="pending">Mover: Pendiente</option>
                        <option value="in_progress">Mover: En Curso</option>
                        <option value="in_review">Mover: En Revisión</option>
                        <option value="completed">Mover: Completada</option>
                        <option value="blocked">Mover: Bloqueada</option>
                      </select>
                    </div>
                  </div>
                } @empty {
                  <div class="h-24 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                    Sin tareas
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TasksComponent {
  @Output() onNewTask = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  activeView: 'list' | 'kanban' = 'list';

  searchQuery = '';
  filterStatus = 'all';
  filterPriority = 'all';
  filterAssignee = 'all';

  readonly kanbanColumns: { status: TaskStatus; title: string; dotClass: string }[] = [
    { status: 'pending', title: 'Pendiente', dotClass: 'bg-slate-400' },
    { status: 'in_progress', title: 'En Curso', dotClass: 'bg-sky-500' },
    { status: 'in_review', title: 'En Revisión', dotClass: 'bg-amber-500' },
    { status: 'blocked', title: 'Bloqueada', dotClass: 'bg-rose-500' },
    { status: 'completed', title: 'Completada', dotClass: 'bg-emerald-500' }
  ];

  get filteredTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(task => {
      // Query filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matches = 
          task.title.toLowerCase().includes(q) ||
          task.code.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          (task.assignee?.name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status filter
      if (this.filterStatus !== 'all' && task.status !== this.filterStatus) {
        return false;
      }

      // Priority filter
      if (this.filterPriority !== 'all' && task.priority !== this.filterPriority) {
        return false;
      }

      // Assignee filter
      if (this.filterAssignee !== 'all' && task.assigneeId !== this.filterAssignee) {
        return false;
      }

      return true;
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks.filter(t => t.status === status);
  }

  getCompletedChecklistCount(task: Task): number {
    return (task.checklist || []).filter(c => c.done).length;
  }

  isOverdue(dueDate: string, status: TaskStatus): boolean {
    if (status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  onStatusChange(taskId: string, newStatus: TaskStatus): void {
    this.opsService.updateTaskStatus(taskId, newStatus);
    this.notificationService.info('Estado actualizado', `La tarea cambió a estado: ${newStatus}`);
  }

  deleteTask(task: Task): void {
    if (confirm(`¿Estás seguro de eliminar la tarea ${task.code}?`)) {
      this.opsService.deleteTask(task.id);
      this.notificationService.warning('Tarea eliminada', `Se eliminó la tarea ${task.code}.`);
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterAssignee = 'all';
  }
}
