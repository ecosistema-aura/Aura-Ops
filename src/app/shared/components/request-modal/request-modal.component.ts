import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../core/services/operations.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RequestPriority, RequestType } from '../../../core/models/request.model';

@Component({
  selector: 'app-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0B192C]/80 backdrop-blur-xs" (click)="close()"></div>
        <div class="relative w-full max-w-md rounded-lg bg-[#112238] border border-[#203C60] shadow-2xl p-5 text-white text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-[#1E3756] mb-3">
            <h3 class="text-sm font-semibold text-white">Nueva Solicitud</h3>
            <button type="button" (click)="close()" class="text-slate-400 hover:text-white">&times;</button>
          </div>

          <form (ngSubmit)="saveRequest()" class="space-y-3">
            <div>
              <label class="block text-slate-300 mb-1">Título *</label>
              <input 
                type="text" 
                [(ngModel)]="title" 
                name="title" 
                required
                placeholder="ej. Reemplazo de baterías montacargas"
                class="w-full px-2.5 py-1.5 border border-[#1E3756] bg-[#0B192C] text-white rounded focus:outline-none focus:border-sky-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-300 mb-1">Tipo</label>
                <select [(ngModel)]="type" name="type" class="w-full px-2 py-1.5 border border-[#1E3756] bg-[#0B192C] text-white rounded">
                  <option value="compra">Compra</option>
                  <option value="presupuesto">Presupuesto</option>
                  <option value="acceso_sistemas">Acceso TI</option>
                  <option value="permiso">Permiso</option>
                  <option value="modificacion_proceso">Procesos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-300 mb-1">Costo estimado (USD)</label>
                <input type="number" [(ngModel)]="estimatedCost" name="estimatedCost" placeholder="ej. 350" class="w-full px-2.5 py-1.5 border border-[#1E3756] bg-[#0B192C] text-white rounded focus:outline-none focus:border-sky-400" />
              </div>
            </div>

            <div>
              <label class="block text-slate-300 mb-1">Justificación *</label>
              <textarea 
                [(ngModel)]="justification" 
                name="justification" 
                rows="2"
                required
                placeholder="Motivo del requerimiento..."
                class="w-full px-2.5 py-1.5 border border-[#1E3756] bg-[#0B192C] text-white rounded focus:outline-none focus:border-sky-400"
              ></textarea>
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-[#1E3756]">
              <button type="button" (click)="close()" class="px-3 py-1 text-slate-300 hover:text-white rounded">Cancelar</button>
              <button type="submit" [disabled]="!title.trim() || !justification.trim()" class="px-3 py-1 bg-white text-[#0B192C] font-semibold rounded shadow-xs disabled:opacity-50 transition-colors">Enviar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class RequestModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  readonly opsService = inject(OperationsService);
  private readonly notificationService = inject(NotificationService);

  title = '';
  type: RequestType = 'compra';
  priority: RequestPriority = 'medium';
  requesterId = 'u1';
  estimatedCost: number | null = null;
  justification = '';

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  saveRequest(): void {
    if (!this.title.trim() || !this.justification.trim()) return;

    this.opsService.addRequest({
      title: this.title.trim(),
      description: '',
      type: this.type,
      priority: this.priority,
      requesterId: this.requesterId,
      justification: this.justification.trim(),
      estimatedCost: this.estimatedCost || undefined,
      currency: this.estimatedCost ? 'USD' : undefined,
      attachmentsCount: 0
    });

    this.notificationService.success('Enviada', this.title);
    this.title = '';
    this.justification = '';
    this.estimatedCost = null;
    this.close();
  }
}
