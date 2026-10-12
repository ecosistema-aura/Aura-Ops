import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { OperationRequest, RequestStatus } from '../../core/models/request.model';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Centro de Aprobaciones</h2>
          <p class="text-xs text-slate-500 mt-0.5">Control de autorizaciones ejecutivas, presupuestos y validación de cambios.</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-3 py-1.5 rounded-lg border bg-white text-slate-700 shadow-2xs font-medium">
            Pendientes de firma: <strong class="text-slate-900 font-bold">{{ pendingCount }}</strong>
          </span>
        </div>
      </div>

      <!-- Tab Filters: Pendientes vs Resueltas -->
      <div class="flex border-b border-slate-200 gap-6 text-xs">
        <button
          type="button"
          (click)="tab = 'pending'"
          [ngClass]="tab === 'pending' ? 'border-slate-900 text-slate-900 font-semibold border-b-2' : 'text-slate-500 hover:text-slate-800'"
          class="pb-3 px-1 transition-colors flex items-center gap-1.5"
        >
          <span>Requieren Decisión</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white font-mono">{{ pendingCount }}</span>
        </button>
        <button
          type="button"
          (click)="tab = 'resolved'"
          [ngClass]="tab === 'resolved' ? 'border-slate-900 text-slate-900 font-semibold border-b-2' : 'text-slate-500 hover:text-slate-800'"
          class="pb-3 px-1 transition-colors flex items-center gap-1.5"
        >
          <span>Historial de Resoluciones</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">{{ resolvedCount }}</span>
        </button>
      </div>

      <!-- List of Requests to approve/review -->
      <div class="space-y-4">
        @for (req of currentTabRequests; track req.id) {
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-colors">
            <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <!-- Info column -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="font-mono text-xs font-bold text-slate-600">{{ req.code }}</span>
                  <app-badge [value]="req.status"></app-badge>
                  <app-badge [value]="req.priority"></app-badge>
                  <span class="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {{ req.type }}
                  </span>
                </div>

                <h3 class="text-base font-semibold text-slate-900 leading-snug">{{ req.title }}</h3>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ req.description || req.justification }}</p>

                <!-- Justification Box -->
                <div class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                  <span class="font-semibold text-slate-700 block mb-0.5">Motivo y justificación técnica:</span>
                  <p class="text-slate-600 text-[11px] leading-relaxed">{{ req.justification }}</p>
                </div>

                <!-- Requester and cost details -->
                <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold {{ req.requester?.avatarColor || 'bg-slate-700 text-white' }}">
                      {{ req.requester?.initials || 'OP' }}
                    </span>
                    <span class="font-medium text-slate-800">{{ req.requester?.name }}</span>
                    <span class="text-slate-400">({{ req.requester?.department }})</span>
                  </div>

                  @if (req.estimatedCost) {
                    <span>&bull;</span>
                    <div class="font-semibold text-slate-900">
                      Monto solicitado: \${{ req.estimatedCost | number }} {{ req.currency }}
                    </div>
                  }

                  <span>&bull;</span>
                  <span class="text-slate-400">Enviada: {{ req.submittedAt | date:'mediumDate' }}</span>
                </div>

                <!-- Existing notes if resolved -->
                @if (req.approvalNotes) {
                  <div class="mt-3 p-2.5 bg-slate-100/70 rounded-md text-xs text-slate-700 border border-slate-200">
                    <span class="font-semibold text-[11px]">Nota de resolución:</span> {{ req.approvalNotes }}
                    @if (req.reviewedAt) {
                      <span class="text-slate-400 text-[10px] ml-2">({{ req.reviewedAt | date:'short' }})</span>
                    }
                  </div>
                }
              </div>

              <!-- Action resolution panel (only for pending) -->
              @if (req.status === 'pending_approval') {
                <div class="w-full lg:w-72 bg-slate-50 rounded-lg p-3.5 border border-slate-200 flex flex-col gap-2.5">
                  <label class="text-[11px] font-semibold text-slate-700">Comentario o condición resolutiva:</label>
                  <textarea 
                    [(ngModel)]="resolutionNotes[req.id]" 
                    rows="2"
                    placeholder="ej. Aprobado con cargo a partida Q3 / Se requiere informe..."
                    class="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  ></textarea>

                  <div class="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      type="button" 
                      (click)="resolve(req.id, 'approved')"
                      class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Aprobar</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="resolve(req.id, 'rejected')"
                      class="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Rechazar</span>
                    </button>
                  </div>

                  <button 
                    type="button" 
                    (click)="resolve(req.id, 'changes_requested')"
                    class="w-full py-1 text-center text-[11px] text-amber-800 hover:text-amber-900 hover:underline font-medium"
                  >
                    Solicitar Modificaciones &rarr;
                  </button>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
            @if (tab === 'pending') {
              No hay solicitudes pendientes de aprobación en este momento. Todas las operaciones están al día.
            } @else {
              No hay registros en el historial de resoluciones.
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ApprovalsComponent {
  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  tab: 'pending' | 'resolved' = 'pending';
  resolutionNotes: Record<string, string> = {};

  get pendingCount(): number {
    return this.opsService.enrichedRequests().filter(r => r.status === 'pending_approval').length;
  }

  get resolvedCount(): number {
    return this.opsService.enrichedRequests().filter(r => r.status !== 'pending_approval').length;
  }

  get currentTabRequests(): OperationRequest[] {
    const list = this.opsService.enrichedRequests();
    if (this.tab === 'pending') {
      return list.filter(r => r.status === 'pending_approval');
    }
    return list.filter(r => r.status !== 'pending_approval');
  }

  resolve(requestId: string, status: RequestStatus): void {
    const note = this.resolutionNotes[requestId] || (status === 'approved' ? 'Aprobado sin objeciones.' : 'Resolución aplicada por la jefatura operativa.');
    this.opsService.reviewRequest(requestId, status, 'u1', note);

    if (status === 'approved') {
      this.notificationService.success('Aprobación concedida', 'La solicitud fue autorizada formalmente.');
    } else if (status === 'rejected') {
      this.notificationService.warning('Solicitud rechazada', 'Se ha denegado la solicitud con las observaciones indicadas.');
    } else {
      this.notificationService.info('Cambios solicitados', 'Se notificó al solicitante para actualizar la propuesta.');
    }

    delete this.resolutionNotes[requestId];
  }
}
