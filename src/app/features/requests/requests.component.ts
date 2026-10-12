import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header & Action with Aura Navy & Crimson -->
      <div class="flex items-center justify-between pb-1">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
            <h2 class="text-2xl font-bold text-white tracking-tight">Solicitudes Operativas</h2>
          </div>
          <p class="text-sm text-slate-400 mt-1">Requerimientos internos: compras de insumos, accesos a sistemas y presupuestos.</p>
        </div>

        <button 
          type="button"
          (click)="onNewRequest.emit()"
          class="text-sm px-4 py-2 bg-white text-[#0B192C] font-semibold hover:bg-slate-100 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span class="text-[#E11D48] font-bold">+</span>
          <span>Nueva Solicitud</span>
        </button>
      </div>

      <!-- Clean List in Aura Navy -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden divide-y divide-[#1E3756]/60 text-sm shadow-xs">
        @for (req of opsService.enrichedRequests(); track req.id) {
          <div class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#152B44]/80 transition-colors">
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <span class="font-mono text-xs font-bold text-sky-400">{{ req.code }}</span>
                <span class="font-semibold text-white text-base">{{ req.title }}</span>
                <app-badge [value]="req.status"></app-badge>
              </div>
              <p class="text-sm text-slate-300 mt-1.5 leading-relaxed">{{ req.justification }}</p>
              <div class="text-xs text-slate-400 mt-2 flex items-center gap-2.5 font-medium">
                <span>Solicitado por: <strong class="text-slate-200">{{ req.requester?.name }}</strong> ({{ req.requester?.department }})</span>
                @if (req.estimatedCost) {
                  <span>&bull;</span>
                  <span class="font-mono font-bold text-emerald-400 text-xs">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                }
              </div>
            </div>

            <div class="text-right text-xs text-slate-400 shrink-0 font-mono">
              {{ req.submittedAt | date:'shortDate' }}
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center text-sm text-slate-400">No hay solicitudes registradas</div>
        }
      </div>
    </div>
  `
})
export class RequestsComponent {
  @Output() onNewRequest = new EventEmitter<void>();
  readonly opsService = inject(OperationsService);
}
