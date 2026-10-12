import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../core/services/operations.service';
import { InternalProcess } from '../../core/models/process.model';

@Component({
  selector: 'app-processes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Seguimiento de Procesos Internos (SOP)</h2>
          <p class="text-xs text-slate-500 mt-0.5">Estandarización de flujos de trabajo, etapas y cumplimiento de directrices operativas.</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-3 py-1.5 rounded-lg border bg-white text-slate-700 shadow-2xs font-medium">
            Procesos auditados: <strong class="text-slate-900 font-bold">{{ opsService.processes().length }}</strong>
          </span>
        </div>
      </div>

      <!-- Process Cards Grid -->
      <div class="space-y-6">
        @for (proc of opsService.enrichedProcesses(); track proc.id) {
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 hover:border-slate-300 transition-colors">
            <!-- Header of Process Card -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{ proc.code }}</span>
                  <span class="font-mono text-[11px] text-slate-400 font-medium">{{ proc.sopDocumentCode }}</span>
                  <span class="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {{ proc.status }}
                  </span>
                </div>
                <h3 class="text-base font-semibold text-slate-900">{{ proc.title }}</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{{ proc.description }}</p>
              </div>

              <!-- Metrics Summary -->
              <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200/60 self-start md:self-auto">
                <div class="text-right">
                  <span class="text-[10px] text-slate-500 block uppercase font-medium">Cumplimiento</span>
                  <span class="text-sm font-bold text-slate-900">{{ proc.complianceRate }}%</span>
                </div>
                <div class="h-8 w-px bg-slate-200"></div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-500 block uppercase font-medium">Tiempo Meta</span>
                  <span class="text-sm font-bold text-slate-900">{{ proc.targetDays }} días</span>
                </div>
                <div class="h-8 w-px bg-slate-200"></div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-500 block uppercase font-medium">Instancias</span>
                  <span class="text-sm font-bold text-slate-900">{{ proc.activeInstances }} activas</span>
                </div>
              </div>
            </div>

            <!-- Stages Progression / Workflow Pipeline -->
            <div class="mt-5">
              <h4 class="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">Etapas del Procedimiento Operativo</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                @for (stage of proc.stages; track stage.id) {
                  <div class="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between text-[11px] mb-1.5">
                        <span class="font-bold text-slate-600 font-mono">0{{ stage.order }}.</span>
                        <span class="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                          {{ stage.responsibleRole }}
                        </span>
                      </div>
                      <h5 class="text-xs font-semibold text-slate-900">{{ stage.name }}</h5>
                      <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ stage.description }}</p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-200/60">
                      <div class="flex items-center justify-between text-[11px] mb-1">
                        <span class="text-slate-500">Puntos de control</span>
                        <span class="font-mono font-medium text-slate-800">{{ stage.completedChecks }}/{{ stage.totalChecks }}</span>
                      </div>
                      <div class="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div 
                          class="bg-slate-800 h-full rounded-full transition-all duration-300"
                          [style.width.%]="(stage.completedChecks / stage.totalChecks) * 100"
                        ></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Footer: Owner & Audit Info -->
            <div class="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div class="flex items-center gap-2">
                <span class="text-slate-400">Responsable del Proceso:</span>
                <strong class="text-slate-700 font-medium">{{ proc.owner?.name }}</strong>
                <span>({{ proc.department }})</span>
              </div>

              <div class="flex items-center gap-2 text-slate-400">
                <span>Última auditoría de calidad: {{ proc.lastAuditDate }}</span>
              </div>
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
