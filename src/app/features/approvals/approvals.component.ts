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
      <!-- Header & Tab with Aura Navy -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
            <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Control de Autorizaciones</span>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Aprobaciones</h2>
          <p class="text-sm text-slate-400 mt-1">Autorización de presupuestos, compras y cambios operativos clave.</p>
        </div>

        <div class="flex gap-2">
          <button 
            type="button" 
            (click)="tab = 'pending'"
            [ngClass]="tab === 'pending' ? 'bg-white text-[#0B192C] font-semibold shadow-xs' : 'text-slate-300 hover:bg-[#152B44] border border-[#1E3756]'"
            class="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
          >
            Pendientes ({{ pendingCount }})
          </button>
          <button 
            type="button" 
            (click)="tab = 'resolved'"
            [ngClass]="tab === 'resolved' ? 'bg-white text-[#0B192C] font-semibold shadow-xs' : 'text-slate-300 hover:bg-[#152B44] border border-[#1E3756]'"
            class="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
          >
            Historial
          </button>
        </div>
      </div>

      <!-- Clean List in Aura Navy -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden divide-y divide-[#1E3756]/60 shadow-md">
        @for (req of currentTabRequests; track req.id) {
          <div class="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#152B44]/60 transition-colors">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="font-mono text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">{{ req.code }}</span>
                <span class="text-base font-semibold text-white">{{ req.title }}</span>
                <app-badge [value]="req.status"></app-badge>
              </div>
              <p class="text-sm text-slate-300 mt-2 leading-relaxed">{{ req.justification }}</p>
              <div class="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-3">
                <span>Por: <strong class="text-slate-200">{{ req.requester?.name }}</strong> ({{ req.requester?.department }})</span>
                @if (req.estimatedCost) {
                  <span>&bull;</span>
                  <span class="font-mono font-medium text-emerald-400 text-sm">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                }
              </div>
            </div>

            @if (req.status === 'pending_approval') {
              <div class="flex items-center gap-3 shrink-0">
                <button 
                  type="button" 
                  (click)="resolve(req.id, 'approved')"
                  class="px-4 py-2.5 text-sm bg-white text-[#0B192C] font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                  Aprobar
                </button>
                <button 
                  type="button" 
                  (click)="resolve(req.id, 'rejected')"
                  class="px-4 py-2.5 text-sm text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-900/50 rounded-lg transition-colors cursor-pointer"
                >
                  Rechazar
                </button>
              </div>
            }
          </div>
        } @empty {
          <div class="py-12 text-center text-sm text-slate-400">
            {{ tab === 'pending' ? 'No hay solicitudes pendientes de aprobación' : 'No hay historial disponible' }}
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
