import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../core/services/operations.service';

@Component({
  selector: 'app-processes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
          <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Estandarización y SOPs</span>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Procesos Internos</h2>
        <p class="text-sm text-slate-400 mt-1">Procedimientos estándar de operación (SOP), control de etapas y cumplimiento.</p>
      </div>

      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden divide-y divide-[#1E3756]/60 shadow-md">
        @for (proc of opsService.enrichedProcesses(); track proc.id) {
          <div class="p-5 sm:p-6 hover:bg-[#152B44]/60 transition-colors">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2.5">
                  <span class="font-mono text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">{{ proc.code }}</span>
                  <span class="text-base font-semibold text-white">{{ proc.title }}</span>
                  <span class="text-xs text-slate-400 font-mono bg-[#0B192C] px-2 py-0.5 rounded border border-[#1E3756]">Doc: {{ proc.sopDocumentCode }}</span>
                </div>
                <p class="text-sm text-slate-300 mt-2 leading-relaxed">{{ proc.description }}</p>
              </div>

              <div class="text-right shrink-0 bg-[#0B192C] px-4 py-2.5 rounded-lg border border-[#1E3756]">
                <span class="text-lg font-bold text-sky-300">{{ proc.complianceRate }}%</span>
                <span class="text-xs text-slate-400 block font-medium">Cumplimiento</span>
              </div>
            </div>

            <!-- Stages Line with comfortable size -->
            <div class="mt-4 pt-4 border-t border-[#1E3756]/60 flex items-center gap-3 overflow-x-auto text-xs pb-1">
              @for (stage of proc.stages; track stage.id; let idx = $index) {
                <div class="flex items-center gap-2 shrink-0 bg-[#0B192C]/60 px-3 py-1.5 rounded-md border border-[#1E3756]/70 text-slate-300">
                  <span class="w-2 h-2 rounded-full" [ngClass]="stage.completedChecks === stage.totalChecks ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                  <span class="font-medium text-slate-200">{{ stage.name }}</span>
                  <span class="text-[11px] text-slate-400 font-mono">({{ stage.completedChecks }}/{{ stage.totalChecks }})</span>
                  @if (idx < proc.stages.length - 1) {
                    <span class="text-slate-500 ml-1">&rarr;</span>
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
