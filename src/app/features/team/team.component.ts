import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { NotificationService } from '../../core/services/notification.service';
import { Department, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
            <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Directorio de Operaciones</span>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Equipo y Responsables</h2>
          <p class="text-sm text-slate-400 mt-1">Responsables de área, roles funcionales y distribución de carga de trabajo.</p>
        </div>

        <button 
          type="button"
          (click)="showAddModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#0B192C] font-bold text-sm hover:bg-slate-100 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <svg class="w-4 h-4 text-[#0B192C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
          Nuevo Responsable
        </button>
      </div>

      <!-- Clean Directory Table in Aura Navy -->
      <div class="bg-[#112238] rounded-xl border border-[#1E3756] overflow-hidden shadow-md">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-[#1E3756] text-slate-400 font-semibold text-xs uppercase tracking-wider bg-[#0E1D31]">
                <th class="py-3.5 px-5">Nombre</th>
                <th class="py-3.5 px-5">Rol</th>
                <th class="py-3.5 px-5">Área</th>
                <th class="py-3.5 px-5">Carga activa</th>
                <th class="py-3.5 px-5 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E3756]/60">
              @for (m of teamMembersWithWorkload; track m.id) {
                <tr class="hover:bg-[#152B44]/60 transition-colors">
                  <td class="py-4 px-5">
                    <div class="flex items-center gap-3">
                      <span class="w-8 h-8 rounded-full bg-slate-800 border border-[#1E3756] flex items-center justify-center text-xs font-bold text-sky-300">
                        {{ m.initials }}
                      </span>
                      <span class="font-semibold text-white">{{ m.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-5 text-slate-300">{{ m.role }}</td>
                  <td class="py-4 px-5 text-slate-400">{{ m.department }}</td>
                  <td class="py-4 px-5">
                    <span class="font-mono text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-md">
                      {{ m.activeCount }} tareas
                    </span>
                  </td>
                  <td class="py-4 px-5 text-right text-slate-400 font-mono text-xs">{{ m.email }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Clean Add Member Modal in Aura Navy -->
      @if (showAddModal) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#0B192C]/80 backdrop-blur-xs" (click)="showAddModal = false"></div>
          <div class="relative w-full max-w-md rounded-xl bg-[#112238] border border-[#203C60] shadow-2xl p-6 text-white">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2 h-2 rounded-full bg-[#E11D48]"></span>
              <h3 class="text-base font-bold text-white">Nuevo Responsable</h3>
            </div>
            <form (ngSubmit)="saveMember()" class="space-y-4 text-sm">
              <div>
                <label class="block text-slate-300 text-xs font-medium mb-1.5">Nombre completo</label>
                <input type="text" [(ngModel)]="newName" name="newName" required class="w-full px-3.5 py-2.5 border border-[#1E3756] bg-[#0B192C] text-white rounded-lg focus:outline-none focus:border-sky-400 text-sm" placeholder="Ej. Carlos Mendoza" />
              </div>
              <div>
                <label class="block text-slate-300 text-xs font-medium mb-1.5">Correo electrónico</label>
                <input type="email" [(ngModel)]="newEmail" name="newEmail" required class="w-full px-3.5 py-2.5 border border-[#1E3756] bg-[#0B192C] text-white rounded-lg focus:outline-none focus:border-sky-400 text-sm" placeholder="carlos@aura.pe" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 text-xs font-medium mb-1.5">Rol operativo</label>
                  <select [(ngModel)]="newRole" name="newRole" class="w-full px-3 py-2.5 border border-[#1E3756] bg-[#0B192C] text-white rounded-lg text-sm">
                    <option value="Operador">Operador</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Líder de Operaciones">Líder</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-300 text-xs font-medium mb-1.5">Área</label>
                  <select [(ngModel)]="newDepartment" name="newDepartment" class="w-full px-3 py-2.5 border border-[#1E3756] bg-[#0B192C] text-white rounded-lg text-sm">
                    <option value="Operaciones">Operaciones</option>
                    <option value="Logística">Logística</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="TI & Sistemas">TI & Sistemas</option>
                    <option value="Calidad y Cumplimiento">Calidad</option>
                  </select>
                </div>
              </div>
              <div class="pt-4 flex justify-end gap-3 border-t border-[#1E3756]">
                <button type="button" (click)="showAddModal = false" class="px-4 py-2 text-slate-300 hover:text-white rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" [disabled]="!newName.trim() || !newEmail.trim()" class="px-4 py-2 bg-white text-[#0B192C] font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer">Guardar</button>
              </div>
            </form>
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
    return this.opsService.users().map(u => ({
      ...u,
      activeCount: tasks.filter(t => t.assigneeId === u.id && t.status !== 'completed').length
    }));
  }

  saveMember(): void {
    if (!this.newName.trim() || !this.newEmail.trim()) return;
    const parts = this.newName.trim().split(' ');
    const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();

    this.opsService.addUser({
      name: this.newName.trim(),
      email: this.newEmail.trim(),
      initials,
      role: this.newRole,
      department: this.newDepartment,
      avatarColor: 'bg-sky-900 text-sky-100'
    });

    this.notificationService.success('Registrado', this.newName);
    this.newName = '';
    this.newEmail = '';
    this.showAddModal = false;
  }
}
