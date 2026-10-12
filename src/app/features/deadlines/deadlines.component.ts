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
    <div class="space-y-6 max-w-5xl">
      <div>
        <h2 class="text-base font-semibold text-white tracking-tight">Plazos</h2>
        <p class="text-xs text-slate-400">Control cronológico de fechas de entrega y vencimientos.</p>
      </div>

      <!-- Overdue if any -->
      @if (overdueTasks.length > 0) {
        <div class="bg-[#112238] rounded-lg border border-rose-900/60 overflow-hidden shadow-2xs">
          <div class="px-4 py-2.5 border-b border-rose-900/60 flex items-center justify-between text-xs font-semibold text-rose-300 bg-rose-950/30">
            <span>Vencidas ({{ overdueTasks.length }})</span>
          </div>
          <div class="divide-y divide-[#1E3756]/60 text-xs">
            @for (task of overdueTasks; track task.id) {
              <div class="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] text-sky-400">{{ task.code }}</span>
                    <span class="font-medium text-white">{{ task.title }}</span>
                  </div>
                  <div class="text-[11px] text-rose-400 mt-0.5 font-medium">Venció el {{ task.dueDate }} &bull; {{ task.assignee?.name }}</div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    type="button" 
                    (click)="markComplete(task)"
                    class="px-2.5 py-1 text-[11px] bg-white text-[#0B192C] font-semibold rounded hover:bg-slate-100 transition-colors"
                  >
                    Completar
                  </button>
                  <button 
                    type="button" 
                    (click)="extendDeadline(task, 2)"
                    class="px-2.5 py-1 text-[11px] border border-[#1E3756] text-slate-300 rounded hover:bg-[#152B44] transition-colors"
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
      <div class="bg-[#112238] rounded-lg border border-[#1E3756] overflow-hidden shadow-2xs">
        <div class="px-4 py-2.5 border-b border-[#1E3756] text-xs font-semibold text-white">
          Próximas entregas
        </div>
        <div class="divide-y divide-[#1E3756]/60 text-xs">
          @for (task of upcomingTasks; track task.id) {
            <div class="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] text-sky-400">{{ task.code }}</span>
                  <span class="font-medium text-white">{{ task.title }}</span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">Asignado a {{ task.assignee?.name }}</div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <span class="font-mono text-[11px] text-slate-300">{{ task.dueDate }}</span>
                <button 
                  type="button" 
                  (click)="markComplete(task)"
                  class="text-[11px] text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Listo
                </button>
              </div>
            </div>
          } @empty {
            <div class="py-8 text-center text-xs text-slate-400">Sin tareas pendientes de entrega</div>
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
