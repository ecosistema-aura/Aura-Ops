import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../core/services/operations.service';

@Component({
  selector: 'app-processes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 max-w-5xl">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Procesos Internos</h2>
        <p class="text-xs text-slate-400">Procedimientos estándar de operación (SOP) y etapas.</p>
      </div>

      <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden divide-y divide-slate-100 text-xs">
        @for (proc of opsService.enrichedProcesses(); track proc.id) {
          <div class="p-4 hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] text-slate-400">{{ proc.code }}</span>
                  <span class="font-medium text-slate-900">{{ proc.title }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">({{ proc.sopDocumentCode }})</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{{ proc.description }}</p>
              </div>

              <div class="text-right shrink-0">
                <span class="font-medium text-slate-900">{{ proc.complianceRate }}%</span>
                <span class="text-[10px] text-slate-400 block">Cumplimiento</span>
              </div>
            </div>

            <!-- Compact Stages Line -->
            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
              @for (stage of proc.stages; track stage.id; let idx = $index) {
                <div class="flex items-center gap-2 shrink-0 text-slate-500">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="stage.completedChecks === stage.totalChecks ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                  <span>{{ stage.name }}</span>
                  @if (idx < proc.stages.length - 1) {
                    <span class="text-slate-300">&rarr;</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProcessesComponent {
  readonly opsService = inject(OperationsService);
}
