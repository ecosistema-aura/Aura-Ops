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
    <div class="space-y-4 max-w-5xl">
      <!-- Header & Tab with Aura Navy -->
      <div class="flex items-center justify-between pb-1">
        <div>
          <h2 class="text-base font-semibold text-[#0B192C] tracking-tight">Aprobaciones</h2>
          <p class="text-xs text-slate-400">Autorización de presupuestos, compras y cambios operativos.</p>
        </div>

        <div class="flex gap-2 text-xs">
          <button 
            type="button" 
            (click)="tab = 'pending'"
            [ngClass]="tab === 'pending' ? 'bg-[#0B192C] text-white font-medium shadow-2xs' : 'text-slate-600 hover:bg-[#F0F4F8]'"
            class="px-2.5 py-1 rounded transition-colors"
          >
            Pendientes ({{ pendingCount }})
          </button>
          <button 
            type="button" 
            (click)="tab = 'resolved'"
            [ngClass]="tab === 'resolved' ? 'bg-[#0B192C] text-white font-medium shadow-2xs' : 'text-slate-600 hover:bg-[#F0F4F8]'"
            class="px-2.5 py-1 rounded transition-colors"
          >
            Historial
          </button>
        </div>
      </div>

      <!-- Clean List -->
      <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
        @for (req of currentTabRequests; track req.id) {
          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F0F4F8]/40 transition-colors">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] text-slate-400">{{ req.code }}</span>
                <span class="font-medium text-[#0B192C]">{{ req.title }}</span>
                <app-badge [value]="req.status"></app-badge>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">{{ req.justification }}</p>
              <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                <span>Por: {{ req.requester?.name }} ({{ req.requester?.department }})</span>
                @if (req.estimatedCost) {
                  <span>&bull;</span>
                  <span class="font-mono font-medium text-[#0B192C]">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                }
              </div>
            </div>

            @if (req.status === 'pending_approval') {
              <div class="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  (click)="resolve(req.id, 'approved')"
                  class="px-3 py-1.5 bg-[#0B192C] hover:bg-[#142842] text-white font-medium rounded shadow-2xs transition-colors"
                >
                  Aprobar
                </button>
                <button 
                  type="button" 
                  (click)="resolve(req.id, 'rejected')"
                  class="px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Rechazar
                </button>
              </div>
            }
          </div>
        } @empty {
          <div class="py-8 text-center text-xs text-slate-400">
            {{ tab === 'pending' ? 'No hay solicitudes pendientes de aprobación' : 'No hay historial' }}
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

  get pendingCount(): number {
    return this.opsService.enrichedRequests().filter(r => r.status === 'pending_approval').length;
  }

  get currentTabRequests(): OperationRequest[] {
    const list = this.opsService.enrichedRequests();
    return this.tab === 'pending'
      ? list.filter(r => r.status === 'pending_approval')
      : list.filter(r => r.status !== 'pending_approval');
  }

  resolve(requestId: string, status: RequestStatus): void {
    const note = status === 'approved' ? 'Aprobado' : 'Rechazado';
    this.opsService.reviewRequest(requestId, status, 'u1', note);

    if (status === 'approved') {
      this.notificationService.success('Aprobada', 'Solicitud concedida');
    } else {
      this.notificationService.info('Rechazada', 'Solicitud denegada');
    }
  }
}
