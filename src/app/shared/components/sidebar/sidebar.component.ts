import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OperationsService } from '../../../core/services/operations.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-60 bg-white border-r border-slate-200/80 flex flex-col h-screen text-slate-600 select-none">
      <!-- Minimalist Header -->
      <div class="h-14 flex items-center px-5 border-b border-slate-100 justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span class="text-xs font-semibold tracking-tight text-slate-900">Aura Ops</span>
        </div>
        <span class="text-[10px] text-slate-400 font-mono">v1.0</span>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-xs">
        <a 
          routerLink="/dashboard" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Inicio</span>
        </a>

        <a 
          routerLink="/tasks" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Tareas</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">{{ opsService.tasks().length }}</span>
        </a>

        <a 
          routerLink="/requests" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>Solicitudes</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">{{ opsService.requests().length }}</span>
        </a>

        <a 
          routerLink="/approvals" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Aprobaciones</span>
          </div>
          @if (opsService.metrics().pendingApprovals > 0) {
            <span class="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono">
              {{ opsService.metrics().pendingApprovals }}
            </span>
          }
        </a>

        <a 
          routerLink="/deadlines" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Plazos</span>
          </div>
          @if (opsService.metrics().overdueTasksCount > 0) {
            <span class="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-mono">
              {{ opsService.metrics().overdueTasksCount }}
            </span>
          }
        </a>

        <a 
          routerLink="/processes" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Procesos (SOP)</span>
        </a>

        <a 
          routerLink="/team" 
          routerLinkActive="bg-slate-100 text-slate-900 font-medium"
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Equipo</span>
        </a>
      </nav>

      <!-- Minimal Bottom Footer -->
      <div class="p-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-semibold">
            SM
          </div>
          <span class="text-slate-700 truncate max-w-[100px]">S. Morales</span>
        </div>
        <button 
          type="button" 
          (click)="resetDemoData()" 
          title="Restablecer datos demo"
          class="text-slate-400 hover:text-slate-700 p-1 rounded"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  resetDemoData(): void {
    if (confirm('¿Restablecer datos del sistema a los valores iniciales?')) {
      this.opsService.resetAllToDemoData();
      this.notificationService.info('Restablecido', 'Datos de prueba recargados.');
    }
  }
}
