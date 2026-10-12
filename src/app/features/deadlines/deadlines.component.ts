import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-deadlines',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Plazos & Calendario Operativo</h2>
          <p class="text-xs text-slate-500 mt-0.5">Control preventivo de fechas límite, retrasos y acuerdos de nivel de servicio (SLA).</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {{ overdueTasks.length }} fuera de plazo
          </span>
          <span class="text-xs px-2.5 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
            {{ dueTodayTasks.length }} vencen hoy
          </span>
        </div>
      </div>

      <!-- SECCIÓN: TAREAS VENCIDAS (ALERTA ROJA) -->
      @if (overdueTasks.length > 0) {
        <div class="bg-rose-50/50 rounded-xl border border-rose-200/80 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              <h3 class="text-sm font-bold text-rose-950">Tareas Vencidas — Acción Correctiva Inmediata</h3>
            </div>
            <span class="text-xs font-mono text-rose-800 font-semibold">{{ overdueTasks.length }} registros</span>
          </div>

          <div class="space-y-2.5">
            @for (task of overdueTasks; track task.id) {
              <div class="bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-[10px] font-bold text-rose-700">{{ task.code }}</span>
                    <app-badge [value]="task.priority"></app-badge>
                    <span class="text-[10px] font-medium text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded">
                      Venció el {{ task.dueDate }} (hace {{ getDaysOverdue(task.dueDate) }} días)
                    </span>
                  </div>
                  <h4 class="text-xs font-semibold text-slate-900">{{ task.title }}</h4>
                  <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Responsable: {{ task.assignee?.name || 'Sin asignar' }}</span>
                    <span>&bull;</span>
                    <span>Área: {{ task.category }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    (click)="markComplete(task)"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Marcar Resuelto
                  </button>
                  <button 
                    type="button" 
                    (click)="extendDeadline(task, 2)"
                    class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
                  >
                    +2 días
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- SECCIÓN: VENCEN HOY -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h3 class="text-sm font-semibold text-slate-900">Vencen Hoy — Compromiso del Turno</h3>
          </div>
          <span class="text-xs font-mono text-slate-500">{{ dueTodayTasks.length }} tareas</span>
        </div>

        <div class="space-y-2.5">
          @for (task of dueTodayTasks; track task.id) {
            <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-[10px] font-bold text-slate-600">{{ task.code }}</span>
                  <app-badge [value]="task.priority"></app-badge>
                  <app-badge [value]="task.status"></app-badge>
                </div>
                <h4 class="text-xs font-semibold text-slate-900">{{ task.title }}</h4>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Responsable: <strong class="text-slate-700">{{ task.assignee?.name }}</strong> ({{ task.assignee?.role }})
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="markComplete(task)"
                  class="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
                >
                  Finalizar Hoy
                </button>
              </div>
            </div>
          } @empty {
            <div class="py-6 text-center text-xs text-slate-400">
              No hay tareas programadas para vencer en el transcurso de hoy.
            </div>
          }
        </div>
      </div>

      <!-- SECCIÓN: PRÓXIMOS PLAZOS (48 - 72h Y SEMANALES) -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <h3 class="text-sm font-semibold text-slate-900">Próximos Vencimientos (Horizonte 7 Días)</h3>
          </div>
          <span class="text-xs font-mono text-slate-500">{{ upcomingTasks.length }} tareas</span>
        </div>

        <div class="divide-y divide-slate-100">
          @for (task of upcomingTasks; track task.id) {
            <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-[10px] font-bold text-slate-500">{{ task.code }}</span>
                  <app-badge [value]="task.priority"></app-badge>
                  <span class="text-[10px] text-slate-500">Vence en {{ getDaysRemaining(task.dueDate) }} días ({{ task.dueDate }})</span>
                </div>
                <h4 class="text-xs font-semibold text-slate-800">{{ task.title }}</h4>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Asignado a: {{ task.assignee?.name || 'Sin asignar' }}
                </div>
              </div>

              <div class="text-xs font-mono text-slate-500">
                Horas est: {{ task.estimatedHours || 2 }}h
              </div>
            </div>
          } @empty {
            <div class="py-6 text-center text-xs text-slate-400">
              No hay entregas pendientes en los próximos 7 días.
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DeadlinesComponent {
  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get overdueTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(t => 
      t.status !== 'completed' && t.dueDate < this.todayStr
    );
  }

  get dueTodayTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(t => 
      t.status !== 'completed' && t.dueDate === this.todayStr
    );
  }

  get upcomingTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(t => 
      t.status !== 'completed' && t.dueDate > this.todayStr
    );
  }

  getDaysOverdue(dueDate: string): number {
    const diff = new Date(this.todayStr).getTime() - new Date(dueDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 3600 * 24)));
  }

  getDaysRemaining(dueDate: string): number {
    const diff = new Date(dueDate).getTime() - new Date(this.todayStr).getTime();
    return Math.max(1, Math.round(diff / (1000 * 3600 * 24)));
  }

  markComplete(task: Task): void {
    this.opsService.updateTaskStatus(task.id, 'completed');
    this.notificationService.success('Tarea resuelta', `Se completó la tarea ${task.code}.`);
  }

  extendDeadline(task: Task, days: number): void {
    const d = new Date(task.dueDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    this.opsService.updateTask(task.id, { dueDate: newDate });
    this.notificationService.info('Plazo extendido', `Nueva fecha límite para ${task.code}: ${newDate}`);
  }
}
