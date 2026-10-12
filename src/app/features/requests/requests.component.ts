import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { OperationRequest, RequestStatus, RequestType } from '../../core/models/request.model';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Solicitudes Operativas</h2>
          <p class="text-xs text-slate-500 mt-0.5">Portal de requerimientos internos: compras, permisos, presupuesto y accesos.</p>
        </div>

        <button 
          type="button"
          (click)="onNewRequest.emit()"
          class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Solicitud</span>
        </button>
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
            placeholder="Buscar por código, título o justificación..."
            class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
          />
        </div>

        <!-- Filter Status -->
        <select 
          [(ngModel)]="filterStatus" 
          class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">Todos los Estados</option>
          <option value="pending_approval">Pendiente de Aprobación</option>
          <option value="approved">Aprobada</option>
          <option value="changes_requested">Requiere Cambios</option>
          <option value="rejected">Rechazada</option>
        </select>

        <!-- Filter Type -->
        <select 
          [(ngModel)]="filterType" 
          class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">Todos los Tipos</option>
          <option value="compra">Compra / Adquisición</option>
          <option value="presupuesto">Presupuesto</option>
          <option value="acceso_sistemas">Acceso a Sistemas</option>
          <option value="permiso">Permiso de Trabajo</option>
          <option value="modificacion_proceso">Modificación de Proceso</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      <!-- Requests Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (req of filteredRequests; track req.id) {
          <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <!-- Top Row: Code, Type badge, Status badge -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-slate-500">{{ req.code }}</span>
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {{ getTypeText(req.type) }}
                  </span>
                </div>
                <app-badge [value]="req.status"></app-badge>
              </div>

              <!-- Title & Description -->
              <h3 class="text-sm font-semibold text-slate-900 leading-snug">{{ req.title }}</h3>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ req.description || req.justification }}</p>

              <!-- Operational Justification Box -->
              <div class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span class="font-semibold text-slate-700 block mb-0.5">Justificación operativa:</span>
                <p class="text-slate-600 text-[11px] leading-relaxed">{{ req.justification }}</p>
              </div>

              <!-- Approver notes if reviewed -->
              @if (req.approvalNotes) {
                <div class="mt-2.5 p-2.5 rounded-lg text-xs border"
                  [ngClass]="{
                    'bg-emerald-50/60 border-emerald-200 text-emerald-800': req.status === 'approved',
                    'bg-amber-50/60 border-amber-200 text-amber-800': req.status === 'changes_requested',
                    'bg-rose-50/60 border-rose-200 text-rose-800': req.status === 'rejected'
                  }"
                >
                  <span class="font-semibold block text-[11px]">Resolución:</span>
                  <p class="text-[11px] mt-0.5 leading-relaxed">{{ req.approvalNotes }}</p>
                </div>
              }
            </div>

            <!-- Footer Meta Info -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold {{ req.requester?.avatarColor || 'bg-slate-700 text-white' }}">
                  {{ req.requester?.initials || 'OP' }}
                </span>
                <span>{{ req.requester?.name || 'Operaciones' }} ({{ req.requester?.department }})</span>
              </div>

              <div class="flex items-center gap-2 font-medium">
                @if (req.estimatedCost) {
                  <span class="text-slate-800 font-mono">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                  <span>&bull;</span>
                }
                <span class="text-slate-400">{{ req.submittedAt | date:'shortDate' }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-2 py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
            No hay solicitudes que coincidan con los filtros seleccionados.
          </div>
        }
      </div>
    </div>
  `
})
export class RequestsComponent {
  @Output() onNewRequest = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);

  searchQuery = '';
  filterStatus = 'all';
  filterType = 'all';

  get filteredRequests(): OperationRequest[] {
    return this.opsService.enrichedRequests().filter(req => {
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matches = 
          req.title.toLowerCase().includes(q) ||
          req.code.toLowerCase().includes(q) ||
          req.justification.toLowerCase().includes(q) ||
          (req.requester?.name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (this.filterStatus !== 'all' && req.status !== this.filterStatus) {
        return false;
      }

      if (this.filterType !== 'all' && req.type !== this.filterType) {
        return false;
      }

      return true;
    });
  }

  getTypeText(type: RequestType): string {
    switch (type) {
      case 'compra': return 'Compra';
      case 'presupuesto': return 'Presupuesto';
      case 'acceso_sistemas': return 'Acceso TI';
      case 'permiso': return 'Permiso';
      case 'modificacion_proceso': return 'Procesos';
      case 'mantenimiento': return 'Mantenimiento';
      case 'soporte': return 'Soporte';
      default: return type;
    }
  }
}
