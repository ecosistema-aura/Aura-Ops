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
    <div class="space-y-4 max-w-5xl">
      <div class="flex items-center justify-between pb-1">
        <div>
          <h2 class="text-base font-semibold text-[#0B192C] tracking-tight">Equipo</h2>
          <p class="text-xs text-slate-400">Responsables de área y roles operativos.</p>
        </div>

        <button 
          type="button"
          (click)="showAddModal = true"
          class="text-xs px-3 py-1.5 bg-[#0B192C] hover:bg-[#142842] text-white rounded shadow-2xs transition-colors"
        >
          + Responsable
        </button>
      </div>

      <!-- Clean Directory Table -->
      <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-400 font-medium text-[11px]">
              <th class="py-2.5 px-4 font-normal">Nombre</th>
              <th class="py-2.5 px-4 font-normal">Rol</th>
              <th class="py-2.5 px-4 font-normal">Área</th>
              <th class="py-2.5 px-4 font-normal">Carga activa</th>
              <th class="py-2.5 px-4 font-normal text-right">Contacto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (m of teamMembersWithWorkload; track m.id) {
              <tr class="hover:bg-[#F0F4F8]/40 transition-colors">
                <td class="py-3 px-4 font-medium text-[#0B192C]">{{ m.name }}</td>
                <td class="py-3 px-4 text-slate-600">{{ m.role }}</td>
                <td class="py-3 px-4 text-slate-500">{{ m.department }}</td>
                <td class="py-3 px-4 font-mono text-[11px] text-[#0B192C]">{{ m.activeCount }} tareas</td>
                <td class="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">{{ m.email }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Clean Add Member Modal -->
      @if (showAddModal) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs" (click)="showAddModal = false"></div>
          <div class="relative w-full max-w-sm rounded-lg bg-white border border-slate-200 shadow-xl p-5 text-slate-800">
            <h3 class="text-sm font-semibold text-[#0B192C] mb-3">Nuevo Responsable</h3>
            <form (ngSubmit)="saveMember()" class="space-y-3 text-xs">
              <div>
                <label class="block text-slate-600 mb-1">Nombre</label>
                <input type="text" [(ngModel)]="newName" name="newName" required class="w-full px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#0B192C]" />
              </div>
              <div>
                <label class="block text-slate-600 mb-1">Email</label>
                <input type="email" [(ngModel)]="newEmail" name="newEmail" required class="w-full px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#0B192C]" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-slate-600 mb-1">Rol</label>
                  <select [(ngModel)]="newRole" name="newRole" class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white">
                    <option value="Operador">Operador</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Líder de Operaciones">Líder</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-600 mb-1">Área</label>
                  <select [(ngModel)]="newDepartment" name="newDepartment" class="w-full px-2 py-1.5 border border-slate-200 rounded bg-white">
                    <option value="Operaciones">Operaciones</option>
                    <option value="Logística">Logística</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="TI & Sistemas">TI</option>
                    <option value="Calidad y Cumplimiento">Calidad</option>
                  </select>
                </div>
              </div>
              <div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" (click)="showAddModal = false" class="px-3 py-1 text-slate-600 hover:bg-slate-50 rounded">Cancelar</button>
                <button type="submit" [disabled]="!newName.trim() || !newEmail.trim()" class="px-3 py-1 bg-[#0B192C] hover:bg-[#142842] text-white rounded shadow-2xs disabled:opacity-50 transition-colors">Guardar</button>
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
      avatarColor: 'bg-[#0B192C] text-slate-100'
    });

    this.notificationService.success('Registrado', this.newName);
    this.newName = '';
    this.newEmail = '';
    this.showAddModal = false;
  }
}
