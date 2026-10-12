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
    <div class="space-y-8 max-w-5xl">
      <!-- Minimalist Header & KPI Row in Aura Navy -->
      <div>
        <h2 class="text-base font-semibold text-white tracking-tight">Resumen Operativo</h2>
        <p class="text-xs text-slate-400 mt-0.5">Estado general de tareas, aprobaciones y plazos del equipo.</p>
        
        <!-- Clean, calm 4-metric strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1E3756]">
          <div class="bg-[#112238] p-3.5 rounded-lg border border-[#1E3756]">
            <div class="text-[11px] text-slate-400 font-medium">Cumplimiento</div>
            <div class="text-xl font-bold text-white mt-1">{{ opsService.metrics().onTimeDeliveryRate }}%</div>
          </div>
          <div class="bg-[#112238] p-3.5 rounded-lg border border-[#1E3756]">
            <div class="text-[11px] text-slate-400 font-medium">Tareas Activas</div>
            <div class="text-xl font-bold text-white mt-1">{{ opsService.metrics().pendingTasks }}</div>
          </div>
          <div class="bg-[#112238] p-3.5 rounded-lg border border-[#1E3756]">
            <div class="text-[11px] text-slate-400 font-medium">Por Aprobar</div>
            <div class="text-xl font-bold text-amber-300 mt-1">{{ opsService.metrics().pendingApprovals }}</div>
          </div>
          <div class="bg-[#112238] p-3.5 rounded-lg border border-[#1E3756]">
            <div class="text-[11px] text-slate-400 font-medium">Fuera de Plazo</div>
            <div class="text-xl font-bold mt-1" [ngClass]="opsService.metrics().overdueTasksCount > 0 ? 'text-rose-400' : 'text-white'">
              {{ opsService.metrics().overdueTasksCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- Clean Section: Prioridades del Turno -->
      <div class="bg-[#112238] rounded-lg border border-[#1E3756] overflow-hidden">
        <div class="px-4 py-3 border-b border-[#1E3756] flex items-center justify-between">
          <div class="text-xs font-semibold text-white">Tareas en curso</div>
          <a routerLink="/tasks" class="text-[11px] text-slate-400 hover:text-white transition-colors">Ver todas &rarr;</a>
        </div>

        <div class="divide-y divide-[#1E3756]/60 text-xs">
          @for (task of priorityTasks; track task.id) {
            <div class="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-[10px] font-mono text-sky-400 w-16">{{ task.code }}</span>
                <span class="font-medium text-white truncate">{{ task.title }}</span>
              </div>

              <div class="flex items-center gap-4 shrink-0 text-slate-400">
                <span class="text-[11px] text-slate-300 hidden sm:inline">{{ task.assignee?.name }}</span>
                <span class="text-[11px]" [ngClass]="isOverdue(task.dueDate) ? 'text-rose-400 font-medium' : 'text-slate-400'">
                  {{ task.dueDate }}
                </span>
                <app-badge [value]="task.status"></app-badge>
                @if (task.status !== 'completed') {
                  <button 
                    type="button" 
                    (click)="completeTask(task)"
                    class="text-[11px] text-slate-300 hover:text-white font-medium transition-colors"
                  >
                    Listo
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="py-8 text-center text-xs text-slate-400">Sin tareas pendientes</div>
          }
        </div>
      </div>

      <!-- Clean Section: Aprobaciones Pendientes -->
      @if (pendingRequests.length > 0) {
        <div class="bg-[#112238] rounded-lg border border-[#1E3756] overflow-hidden">
          <div class="px-4 py-3 border-b border-[#1E3756] flex items-center justify-between">
            <div class="text-xs font-semibold text-white">Solicitudes por autorizar</div>
            <a routerLink="/approvals" class="text-[11px] text-slate-400 hover:text-white transition-colors">Ir a aprobaciones &rarr;</a>
          </div>

          <div class="divide-y divide-[#1E3756]/60 text-xs">
            @for (req of pendingRequests; track req.id) {
              <div class="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] text-sky-400">{{ req.code }}</span>
                    <span class="font-medium text-white">{{ req.title }}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 truncate max-w-lg">{{ req.justification }}</div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    type="button" 
                    (click)="quickApprove(req.id)"
                    class="px-2.5 py-1 text-[11px] font-semibold text-[#0B192C] bg-white hover:bg-slate-100 rounded shadow-xs transition-colors"
                  >
                    Aprobar
                  </button>
                  <button 
                    type="button" 
                    (click)="quickReject(req.id)"
                    class="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-400 rounded transition-colors"
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
