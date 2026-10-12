import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { Department, User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Equipo & Responsables Operativos</h2>
          <p class="text-xs text-slate-500 mt-0.5">Control de dotación, asignaciones, cargas de trabajo y roles de ejecución.</p>
        </div>

        <button 
          type="button"
          (click)="showAddModal = true"
          class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Responsable</span>
        </button>
      </div>

      <!-- Team Members Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (member of teamMembersWithWorkload; track member.id) {
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <!-- Card Header: Avatar & Info -->
              <div class="flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs {{ member.avatarColor }}">
                  {{ member.initials }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-slate-900 truncate">{{ member.name }}</h3>
                  <div class="text-xs font-medium text-slate-600">{{ member.role }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">{{ member.department }}</div>
                </div>
              </div>

              <!-- Workload Progress -->
              <div class="mt-4 pt-3 border-t border-slate-100">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-slate-500">Carga Operativa Actual</span>
                  <span class="font-semibold text-slate-800">{{ member.activeCount }} tareas activas</span>
                </div>
                <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    class="bg-slate-800 h-full rounded-full"
                    [style.width.%]="getWorkloadPercentage(member.activeCount)"
                  ></div>
                </div>
              </div>

              <!-- Stats numbers -->
              <div class="mt-3 grid grid-cols-2 gap-2 text-center text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span class="text-[10px] text-slate-400 block uppercase font-medium">Completadas</span>
                  <span class="font-bold text-slate-800 text-sm font-mono">{{ member.completedCount }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block uppercase font-medium">Email corporativo</span>
                  <span class="text-slate-600 text-[11px] truncate block">{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modal para Registrar Nuevo Responsable -->
      @if (showAddModal) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" (click)="showAddModal = false"></div>
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 class="text-base font-semibold text-slate-900">Registrar Responsable</h3>
                <button type="button" (click)="showAddModal = false" class="text-slate-400 hover:text-slate-600">&times;</button>
              </div>

              <form (ngSubmit)="saveMember()" class="space-y-3.5">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Nombre Completo *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newName" 
                    name="newName" 
                    required 
                    placeholder="ej. Lucía Fernández"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Email Corporativo *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="newEmail" 
                    name="newEmail" 
                    required 
                    placeholder="lucia.fernandez@aura.io"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Rol Operativo</label>
                    <select [(ngModel)]="newRole" name="newRole" class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white">
                      <option value="Operador">Operador</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Líder de Operaciones">Líder de Operaciones</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Gerente">Gerente</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Departamento</label>
                    <select [(ngModel)]="newDepartment" name="newDepartment" class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white">
                      <option value="Operaciones">Operaciones</option>
                      <option value="Logística">Logística</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="TI & Sistemas">TI & Sistemas</option>
                      <option value="Calidad y Cumplimiento">Calidad y Cumplimiento</option>
                    </select>
                  </div>
                </div>

                <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" (click)="showAddModal = false" class="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg">Cancelar</button>
                  <button type="submit" [disabled]="!newName.trim() || !newEmail.trim()" class="px-3 py-1.5 text-xs text-white bg-slate-900 rounded-lg disabled:opacity-50">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TeamComponent {
  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  showAddModal = false;
  newName = '';
  newEmail = '';
  newRole: UserRole = 'Operador';
  newDepartment: Department = 'Operaciones';

  get teamMembersWithWorkload() {
    const tasks = this.opsService.tasks();
    return this.opsService.users().map(u => {
      const activeCount = tasks.filter(t => t.assigneeId === u.id && t.status !== 'completed').length;
      const completedCount = tasks.filter(t => t.assigneeId === u.id && t.status === 'completed').length + (u.completedTasksCount || 0);
      return {
        ...u,
        activeCount,
        completedCount
      };
    });
  }

  getWorkloadPercentage(activeCount: number): number {
    return Math.min(100, (activeCount / 6) * 100);
  }

  saveMember(): void {
    if (!this.newName.trim() || !this.newEmail.trim()) return;

    const parts = this.newName.trim().split(' ');
    const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();

    const colors = [
      'bg-slate-800 text-slate-100',
      'bg-indigo-900 text-indigo-100',
      'bg-sky-900 text-sky-100',
      'bg-emerald-900 text-emerald-100',
      'bg-teal-900 text-teal-100'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.opsService.addUser({
      name: this.newName.trim(),
      email: this.newEmail.trim(),
      initials,
      role: this.newRole,
      department: this.newDepartment,
      avatarColor: randomColor,
      activeTasksCount: 0,
      completedTasksCount: 0
    });

    this.notificationService.success('Responsable registrado', `${this.newName} fue añadido al equipo de operaciones.`);
    this.newName = '';
    this.newEmail = '';
    this.showAddModal = false;
  }
}
