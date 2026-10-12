import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../core/services/operations.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <!-- Left: Title & Operational Status -->
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-sm font-semibold text-slate-900 tracking-tight">{{ title }}</h1>
          <p class="text-[11px] text-slate-500">{{ subtitle }}</p>
        </div>

        <div class="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-[11px] font-medium text-slate-600">Operaciones Normales</span>
        </div>
      </div>

      <!-- Right: Search, Indicators & Actions -->
      <div class="flex items-center gap-3">
        <!-- SLA compliance pill -->
        <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600">
          <span class="text-slate-400">Cumplimiento:</span>
          <span class="font-semibold text-slate-900">{{ opsService.metrics().onTimeDeliveryRate }}%</span>
        </div>

        <!-- Quick actions buttons -->
        <button
          type="button"
          (click)="onNewTask.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Tarea</span>
        </button>

        <button
          type="button"
          (click)="onNewRequest.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-md shadow-xs transition-colors"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="hidden sm:inline">Solicitud</span>
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() title: string = 'Gestión Operativa';
  @Input() subtitle: string = 'Aura Ops — Flujos, plazos y aprobaciones';
  @Output() onNewTask = new EventEmitter<void>();
  @Output() onNewRequest = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);
}
