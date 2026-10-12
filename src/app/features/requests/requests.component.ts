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
    <div class="space-y-4 max-w-5xl">
      <!-- Header & Action with Aura Navy -->
      <div class="flex items-center justify-between pb-1">
        <div>
          <h2 class="text-base font-semibold text-[#0B192C] tracking-tight">Solicitudes</h2>
          <p class="text-xs text-slate-400">Requerimientos operativos y compras internas.</p>
        </div>

        <button 
          type="button"
          (click)="onNewRequest.emit()"
          class="text-xs px-3 py-1.5 bg-[#0B192C] hover:bg-[#142842] text-white rounded shadow-2xs transition-colors"
        >
          + Nueva
        </button>
      </div>

      <!-- Clean List -->
      <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
        @for (req of opsService.enrichedRequests(); track req.id) {
          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0F4F8]/40 transition-colors">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] text-slate-400">{{ req.code }}</span>
                <span class="font-medium text-[#0B192C]">{{ req.title }}</span>
                <app-badge [value]="req.status"></app-badge>
              </div>
              <p class="text-[11px] text-slate-500 mt-1 line-clamp-1">{{ req.justification }}</p>
              <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                <span>Por: {{ req.requester?.name }}</span>
                @if (req.estimatedCost) {
                  <span>&bull;</span>
                  <span class="font-mono font-medium text-[#0B192C]">\${{ req.estimatedCost | number }} {{ req.currency }}</span>
                }
              </div>
            </div>

            <div class="text-right text-[11px] text-slate-400 shrink-0">
              {{ req.submittedAt | date:'shortDate' }}
            </div>
          </div>
        } @empty {
          <div class="py-8 text-center text-xs text-slate-400">No hay solicitudes registradas</div>
        }
      </div>
    </div>
  `
})
export class RequestsComponent {
  @Output() onNewRequest = new EventEmitter<void>();
  readonly opsService = inject(OperationsService);
}
