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
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 select-none">
      <!-- Brand Header -->
      <div class="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 font-bold tracking-tight shadow-sm">
          <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div class="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
            Aura Ops
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-sky-950 text-sky-400 border border-sky-800/60 rounded">Core</span>
          </div>
          <div class="text-[11px] text-slate-400 font-normal">Gestión de Operaciones</div>
        </div>
      </div>

      <!-- Navigation Section -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div class="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          OPERACIONES
        </div>

        <!-- Dashboard -->
        <a 
          routerLink="/dashboard" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Dashboard</span>
        </a>

        <!-- Tareas -->
        <a 
          routerLink="/tasks" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Tareas & Kanban</span>
          </div>
          <span class="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {{ opsService.tasks().length }}
          </span>
        </a>

        <!-- Solicitudes -->
        <a 
          routerLink="/requests" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Solicitudes</span>
          </div>
          <span class="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {{ opsService.requests().length }}
          </span>
        </a>

        <!-- Aprobaciones -->
        <a 
          routerLink="/approvals" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Aprobaciones</span>
          </div>
          @if (opsService.metrics().pendingApprovals > 0) {
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {{ opsService.metrics().pendingApprovals }} pendientes
            </span>
          }
        </a>

        <div class="pt-4 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          CONTROL & SEGUIMIENTO
        </div>

        <!-- Plazos / Deadlines -->
        <a 
          routerLink="/deadlines" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Plazos & Vencimientos</span>
          </div>
          @if (opsService.metrics().overdueTasksCount > 0) {
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {{ opsService.metrics().overdueTasksCount }} vencidas
            </span>
          }
        </a>

        <!-- Procesos Internos -->
        <a 
          routerLink="/processes" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Procesos Internos</span>
          </div>
          <span class="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {{ opsService.processes().length }}
          </span>
        </a>

        <!-- Equipo y Responsables -->
        <a 
          routerLink="/team" 
          routerLinkActive="bg-slate-800 text-white font-medium shadow-sm"
          class="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Responsables</span>
          </div>
          <span class="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {{ opsService.users().length }}
          </span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center text-xs font-semibold">
              SM
            </div>
            <div>
              <div class="text-xs font-medium text-slate-200">Sofía Morales</div>
              <div class="text-[10px] text-slate-400">Líder Ops</div>
            </div>
          </div>
          <button 
            type="button"
            (click)="resetDemoData()"
            title="Restablecer datos de prueba"
            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div class="text-[10px] text-slate-400 text-center flex items-center justify-between px-1">
          <span>Ecosistema Aura</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  resetDemoData(): void {
    if (confirm('¿Restablecer los datos de ejemplo del sistema operativo Aura Ops?')) {
      this.opsService.resetAllToDemoData();
      this.notificationService.info('Datos restablecidos', 'Se han cargado los registros iniciales de Aura Ops.');
    }
  }
}
