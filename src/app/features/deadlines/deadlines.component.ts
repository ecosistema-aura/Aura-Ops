import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-deadlines',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
          <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Cronograma Crítico</span>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Plazos y Vencimientos</h2>
        <p class="text-sm text-slate-400 mt-1">Control cronológico de fechas de entrega, compromisos y alertas de desfase.</p>
      </div>

      <!-- Overdue if any -->
      @if (overdueTasks.length > 0) {
        <div class="bg-[#112238] rounded-xl border border-rose-900/60 overflow-hidden shadow-lg">
          <div class="px-5 py-3 border-b border-rose-900/60 flex items-center justify-between text-sm font-semibold text-rose-300 bg-rose-950/40">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Vencidas ({{ overdueTasks.length }})
            </span>
          </div>
          <div class="divide-y divide-[#1E3756]/60">
            @for (task of overdueTasks; track task.id) {
              <div class="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#152B44]/60 transition-colors">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2.5">
                    <span class="font-mono text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">{{ task.code }}</span>
                    <span class="text-base font-semibold text-white">{{ task.title }}</span>
                  </div>
                  <div class="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-2">
                    <span>Venció el {{ task.dueDate }}</span>
                    <span>&bull;</span>
                    <span class="text-slate-300">Asignado a {{ task.assignee?.name }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <button 
                    type="button" 
                    (click)="markComplete(task)"
                    class="px-3.5 py-2 text-xs bg-white text-[#0B192C] font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Completar
                  </button>
                  <button 
                    type="button" 
                    (click)="extendDeadline(task, 2)"
                    class="px-3.5 py-2 text-xs border border-[#1E3756] text-slate-300 rounded-lg hover:bg-[#152B44] transition-colors cursor-pointer"
                  >
                    +2 días
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Next deliveries -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden shadow-md">
        <div class="px-5 py-3.5 border-b border-[#1E3756] text-sm font-semibold text-white bg-[#0E1D31]">
          Próximas entregas
        </div>
        <div class="divide-y divide-[#1E3756]/60">
          @for (task of upcomingTasks; track task.id) {
            <div class="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#152B44]/60 transition-colors">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2.5">
                  <span class="font-mono text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">{{ task.code }}</span>
                  <span class="text-base font-medium text-white">{{ task.title }}</span>
                </div>
                <div class="text-xs text-slate-400 mt-1.5">Responsable: <strong class="text-slate-300 font-normal">{{ task.assignee?.name }}</strong></div>
              </div>

              <div class="flex items-center gap-4 shrink-0">
                <span class="font-mono text-xs font-semibold text-slate-300 bg-[#0B192C] px-3 py-1.5 rounded-md border border-[#1E3756]">{{ task.dueDate }}</span>
                <button 
                  type="button" 
                  (click)="markComplete(task)"
                  class="text-xs text-sky-300 hover:text-white font-semibold transition-colors px-3 py-1.5 rounded-lg border border-[#1E3756] hover:bg-[#152B44] cursor-pointer"
                >
                  Marcar Listo
                </button>
              </div>
            </div>
          } @empty {
            <div class="py-12 text-center text-sm text-slate-400">Sin tareas pendientes de entrega</div>
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

  get upcomingTasks(): Task[] {
    return this.opsService.enrichedTasks().filter(t => 
      t.status !== 'completed' && t.dueDate >= this.todayStr
    );
  }

  markComplete(task: Task): void {
    this.opsService.updateTaskStatus(task.id, 'completed');
    this.notificationService.success('Completada', task.code);
  }

  extendDeadline(task: Task, days: number): void {
    const d = new Date(task.dueDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    this.opsService.updateTask(task.id, { dueDate: newDate });
    this.notificationService.info('Plazo extendido', `Nueva fecha: ${newDate}`);
  }
}
