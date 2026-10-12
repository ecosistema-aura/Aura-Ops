import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="space-y-8">
      <!-- Minimalist Header & KPI Row in Aura Navy -->
      <div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
          <h2 class="text-2xl font-bold text-white tracking-tight">Centro de Operaciones</h2>
        </div>
        <p class="text-sm text-slate-400 mt-1">Supervisión ejecutiva de tareas activas, autorizaciones y cumplimiento de plazos.</p>
        
        <!-- Clean, prominent 4-metric strip -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div class="bg-[#112238] p-5 rounded-xl border border-[#1E3756] shadow-xs">
            <div class="text-xs uppercase tracking-wider font-semibold text-slate-400">Cumplimiento SLA</div>
            <div class="text-3xl font-extrabold text-white mt-1.5 flex items-baseline gap-2">
              {{ opsService.metrics().onTimeDeliveryRate }}%
              <span class="text-xs font-medium text-emerald-400 font-sans">A tiempo</span>
            </div>
          </div>

          <div class="bg-[#112238] p-5 rounded-xl border border-[#1E3756] shadow-xs">
            <div class="text-xs uppercase tracking-wider font-semibold text-slate-400">Tareas Activas</div>
            <div class="text-3xl font-extrabold text-white mt-1.5">
              {{ opsService.metrics().pendingTasks }}
            </div>
          </div>

          <div class="bg-[#112238] p-5 rounded-xl border border-[#1E3756] shadow-xs">
            <div class="text-xs uppercase tracking-wider font-semibold text-slate-400">Por Autorizar</div>
            <div class="text-3xl font-extrabold text-amber-300 mt-1.5">
              {{ opsService.metrics().pendingApprovals }}
            </div>
          </div>

          <div class="bg-[#112238] p-5 rounded-xl border border-[#1E3756] shadow-xs">
            <div class="text-xs uppercase tracking-wider font-semibold text-slate-400">Fuera de Plazo</div>
            <div class="text-3xl font-extrabold mt-1.5" [ngClass]="opsService.metrics().overdueTasksCount > 0 ? 'text-[#FB7185]' : 'text-white'">
              {{ opsService.metrics().overdueTasksCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- Clean Section: Prioridades del Turno -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden shadow-xs">
        <div class="px-5 py-4 border-b border-[#1E3756] flex items-center justify-between">
          <div class="text-sm font-semibold text-white tracking-wide">Tareas prioritarias en curso</div>
          <a routerLink="/tasks" class="text-xs text-sky-400 hover:text-white font-medium transition-colors">Ver todas &rarr;</a>
        </div>

        <div class="divide-y divide-[#1E3756]/60 text-sm">
          @for (task of priorityTasks; track task.id) {
            <div class="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
              <div class="flex items-center gap-3.5 min-w-0">
                <span class="text-xs font-mono font-bold text-sky-400 w-20 shrink-0">{{ task.code }}</span>
                <span class="font-medium text-white truncate text-sm">{{ task.title }}</span>
              </div>

              <div class="flex items-center gap-4 shrink-0 text-slate-400 text-xs">
                <span class="text-slate-300 hidden sm:inline">{{ task.assignee?.name }}</span>
                <span [ngClass]="isOverdue(task.dueDate) ? 'text-[#FB7185] font-semibold' : 'text-slate-400'">
                  {{ task.dueDate }}
                </span>
                <app-badge [value]="task.status"></app-badge>
                @if (task.status !== 'completed') {
                  <button 
                    type="button" 
                    (click)="completeTask(task)"
                    class="text-xs px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#1C3656] border border-transparent hover:border-[#1E3756] rounded font-medium transition-colors"
                  >
                    Listo
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="py-10 text-center text-sm text-slate-400">Sin tareas pendientes</div>
          }
        </div>
      </div>

      <!-- Clean Section: Aprobaciones Pendientes -->
      @if (pendingRequests.length > 0) {
        <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden shadow-xs">
          <div class="px-5 py-4 border-b border-[#1E3756] flex items-center justify-between">
            <div class="text-sm font-semibold text-white tracking-wide">Solicitudes por autorizar</div>
            <a routerLink="/approvals" class="text-xs text-sky-400 hover:text-white font-medium transition-colors">Ir a aprobaciones &rarr;</a>
          </div>

          <div class="divide-y divide-[#1E3756]/60 text-sm">
            @for (req of pendingRequests; track req.id) {
              <div class="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
                <div class="min-w-0">
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono text-xs font-bold text-sky-400">{{ req.code }}</span>
                    <span class="font-medium text-white text-sm">{{ req.title }}</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-1 truncate max-w-xl">{{ req.justification }}</div>
                </div>

                <div class="flex items-center gap-2.5 shrink-0">
                  <button 
                    type="button" 
                    (click)="quickApprove(req.id)"
                    class="px-3 py-1.5 text-xs font-semibold text-[#0B192C] bg-white hover:bg-slate-100 rounded-md shadow-xs transition-colors"
                  >
                    Aprobar
                  </button>
                  <button 
                    type="button" 
                    (click)="quickReject(req.id)"
                    class="px-3 py-1.5 text-xs text-slate-400 hover:text-[#FB7185] rounded-md transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  @Output() onNewTask = new EventEmitter<void>();
  @Output() onNewRequest = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  get priorityTasks(): Task[] {
    return this.opsService.enrichedTasks()
      .filter(t => t.status !== 'completed')
      .slice(0, 5);
  }

  get pendingRequests() {
    return this.opsService.enrichedRequests()
      .filter(r => r.status === 'pending_approval')
      .slice(0, 3);
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  completeTask(task: Task): void {
    this.opsService.updateTaskStatus(task.id, 'completed');
    this.notificationService.success('Completada', task.title);
  }

  quickApprove(requestId: string): void {
    this.opsService.reviewRequest(requestId, 'approved', 'u1', 'Aprobado');
    this.notificationService.success('Aprobada', 'Solicitud autorizada');
  }

  quickReject(requestId: string): void {
    this.opsService.reviewRequest(requestId, 'rejected', 'u1', 'Rechazada');
    this.notificationService.info('Rechazada', 'Solicitud denegada');
  }
}
