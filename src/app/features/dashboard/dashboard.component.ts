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
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Centro de Control de Operaciones</h2>
          <p class="text-xs text-slate-500 mt-0.5">Supervisión en tiempo real de tareas, flujos de aprobación y procesos internos.</p>
        </div>
        <div class="flex items-center gap-2">
          <button 
            type="button"
            (click)="onNewTask.emit()"
            class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            + Nueva Tarea
          </button>
          <button 
            type="button"
            (click)="onNewRequest.emit()"
            class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            + Registrar Solicitud
          </button>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- SLA Compliance Rate -->
        <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Cumplimiento de Plazos</span>
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold tracking-tight text-slate-900">{{ opsService.metrics().onTimeDeliveryRate }}%</span>
            <span class="text-[11px] text-emerald-600 font-medium">Dentro del SLA</span>
          </div>
          <div class="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="bg-emerald-600 h-full rounded-full" [style.width.%]="opsService.metrics().onTimeDeliveryRate"></div>
          </div>
        </div>

        <!-- Pending Approvals -->
        <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Aprobaciones Pendientes</span>
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold tracking-tight text-slate-900">{{ opsService.metrics().pendingApprovals }}</span>
            <span class="text-[11px] text-amber-700 font-medium">Revisión requerida</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total registradas: {{ opsService.requests().length }}</span>
            <a routerLink="/approvals" class="text-slate-900 font-medium hover:underline">Revisar &rarr;</a>
          </div>
        </div>

        <!-- Overdue Tasks -->
        <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Tareas Vencidas</span>
            <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold tracking-tight" [ngClass]="opsService.metrics().overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-900'">
              {{ opsService.metrics().overdueTasksCount }}
            </span>
            <span class="text-[11px] text-slate-500">Fuera de plazo</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>En curso: {{ opsService.metrics().pendingTasks }}</span>
            <a routerLink="/deadlines" class="text-slate-900 font-medium hover:underline">Ver plazos &rarr;</a>
          </div>
        </div>

        <!-- Active Processes -->
        <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Procesos & SOPs Activos</span>
            <svg class="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold tracking-tight text-slate-900">{{ opsService.metrics().activeProcessesCount }}</span>
            <span class="text-[11px] text-slate-500">Workflows operativos</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Responsables: {{ opsService.metrics().activeTeamMembersCount }}</span>
            <a routerLink="/processes" class="text-slate-900 font-medium hover:underline">Auditar &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Main Columns: Urgencias & Aprobaciones Pendientes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tareas Prioritarias y en Curso -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Tareas Operativas Prioritarias</h3>
              <p class="text-xs text-slate-500">Atención urgente y tareas programadas próximas a vencer</p>
            </div>
            <a routerLink="/tasks" class="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
              Ver todas ({{ opsService.tasks().length }}) &rarr;
            </a>
          </div>

          <div class="mt-4 divide-y divide-slate-100">
            @for (task of priorityTasks; track task.id) {
              <div class="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-mono text-slate-500 font-medium">{{ task.code }}</span>
                    <app-badge [value]="task.priority"></app-badge>
                    <app-badge [value]="task.status"></app-badge>
                  </div>
                  <h4 class="text-xs font-semibold text-slate-900 truncate">{{ task.title }}</h4>
                  <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ task.assignee?.name || 'Sin asignar' }}
                    </span>
                    <span>&bull;</span>
                    <span [ngClass]="isOverdue(task.dueDate) ? 'text-rose-600 font-medium' : ''">
                      Plazo: {{ task.dueDate }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  @if (task.status !== 'completed') {
                    <button 
                      type="button" 
                      (click)="completeTask(task)"
                      title="Marcar completada"
                      class="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                    >
                      Completar
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Solicitudes por Aprobar Rápidas -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Bandeja de Aprobaciones Rápidas</h3>
              <p class="text-xs text-slate-500">Solicitudes que requieren autorización de mando</p>
            </div>
            <a routerLink="/approvals" class="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
              Centro de Aprobación &rarr;
            </a>
          </div>

          <div class="mt-4 divide-y divide-slate-100">
            @for (req of pendingRequests; track req.id) {
              <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-mono text-slate-500 font-medium">{{ req.code }}</span>
                    <app-badge [value]="req.priority"></app-badge>
                    <span class="text-[10px] font-medium text-slate-500 uppercase">{{ req.type }}</span>
                  </div>
                  <h4 class="text-xs font-semibold text-slate-900 truncate">{{ req.title }}</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{{ req.justification }}</p>
                  <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span>Por: {{ req.requester?.name }}</span>
                    @if (req.estimatedCost) {
                      <span>&bull;</span>
                      <span class="font-medium text-slate-700">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-1.5 self-end sm:self-center">
                  <button 
                    type="button" 
                    (click)="quickApprove(req.id)"
                    class="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
                  >
                    Aprobar
                  </button>
                  <button 
                    type="button" 
                    (click)="quickReject(req.id)"
                    class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-md transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            } @empty {
              <div class="py-8 text-center text-xs text-slate-400">
                No hay solicitudes pendientes de aprobación en este momento.
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Procesos Internos & Workflows (SOPs) -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Estado de Procesos Internos (SOPs)</h3>
            <p class="text-xs text-slate-500">Flujos estandarizados y porcentaje de cumplimiento operativo</p>
          </div>
          <a routerLink="/processes" class="text-xs text-slate-600 hover:text-slate-900 font-medium">
            Ver detalle de procesos &rarr;
          </a>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (proc of opsService.enrichedProcesses(); track proc.id) {
            <div class="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span class="font-mono font-medium">{{ proc.code }}</span>
                  <span class="font-mono text-slate-400">{{ proc.sopDocumentCode }}</span>
                </div>
                <h4 class="text-xs font-semibold text-slate-900 line-clamp-1">{{ proc.title }}</h4>
                <p class="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{{ proc.description }}</p>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span class="text-slate-500">Cumplimiento:</span>
                <span class="font-semibold text-slate-900">{{ proc.complianceRate }}%</span>
              </div>
            </div>
          }
        </div>
      </div>
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
      .slice(0, 4);
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  completeTask(task: Task): void {
    this.opsService.updateTaskStatus(task.id, 'completed');
    this.notificationService.success('Tarea completada', `La tarea "${task.title}" se marcó como completada.`);
  }

  quickApprove(requestId: string): void {
    this.opsService.reviewRequest(requestId, 'approved', 'u1', 'Aprobado de forma ejecutiva desde el Dashboard.');
    this.notificationService.success('Solicitud aprobada', 'La solicitud fue aprobada exitosamente.');
  }

  quickReject(requestId: string): void {
    this.opsService.reviewRequest(requestId, 'rejected', 'u1', 'Rechazada desde el Dashboard.');
    this.notificationService.warning('Solicitud rechazada', 'La solicitud fue rechazada.');
  }
}
