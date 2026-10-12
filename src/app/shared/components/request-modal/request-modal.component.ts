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
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" (click)="close()"></div>

        <!-- Modal Dialog -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 class="text-base font-semibold text-slate-900">Nueva Solicitud Operativa</h3>
                <p class="text-xs text-slate-500">Envía requerimientos para aprobación de la línea de mando.</p>
              </div>
              <button 
                type="button" 
                (click)="close()" 
                class="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form (ngSubmit)="saveRequest()" class="mt-4 space-y-4">
              <!-- Título -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Título de la solicitud *</label>
                <input 
                  type="text" 
                  [(ngModel)]="title" 
                  name="title" 
                  required
                  placeholder="ej. Reemplazo de baterías para montacargas eléctrico B2"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>

              <!-- Tipo y Prioridad -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Tipo de Solicitud *</label>
                  <select 
                    [(ngModel)]="type" 
                    name="type"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    <option value="compra">Compra / Adquisición</option>
                    <option value="presupuesto">Aprobación de Presupuesto</option>
                    <option value="acceso_sistemas">Acceso a Sistemas / TI</option>
                    <option value="permiso">Permiso de Trabajo / Ingreso</option>
                    <option value="modificacion_proceso">Modificación de Proceso</option>
                    <option value="mantenimiento">Mantenimiento de Urgencia</option>
                    <option value="soporte">Soporte Operativo</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Nivel de Prioridad</label>
                  <select 
                    [(ngModel)]="priority" 
                    name="priority"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente (Bloquea operación)</option>
                  </select>
                </div>
              </div>

              <!-- Solicitante & Costo Estimado -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Solicitado por *</label>
                  <select 
                    [(ngModel)]="requesterId" 
                    name="requesterId"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
                  >
                    @for (user of opsService.users(); track user.id) {
                      <option [value]="user.id">{{ user.name }} ({{ user.department }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">Costo Estimado (USD, opcional)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="estimatedCost" 
                    name="estimatedCost"
                    min="0"
                    placeholder="ej. 850"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>
              </div>

              <!-- Justificación operativa -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Justificación del Requerimiento *</label>
                <textarea 
                  [(ngModel)]="justification" 
                  name="justification" 
                  rows="3"
                  required
                  placeholder="Explica el motivo, impacto operacional o riesgo de no ejecutar esta solicitud..."
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                ></textarea>
              </div>

              <!-- Descripción técnica o detalles -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Detalles adicionales</label>
                <textarea 
                  [(ngModel)]="description" 
                  name="description" 
                  rows="2"
                  placeholder="Modelos, proveedores sugeridos, horarios propuestos, etc."
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                ></textarea>
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  (click)="close()" 
                  class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="!title.trim() || !justification.trim()"
                  class="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  Enviar para Aprobación
                </button>
              </div>
            </form>
          </div>
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
  description = '';
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
      description: this.description.trim(),
      type: this.type,
      priority: this.priority,
      requesterId: this.requesterId,
      justification: this.justification.trim(),
      estimatedCost: this.estimatedCost || undefined,
      currency: this.estimatedCost ? 'USD' : undefined,
      attachmentsCount: 0
    });

    this.notificationService.success('Solicitud enviada', `La solicitud "${this.title}" se envió al centro de aprobaciones.`);

    // Reset form
    this.title = '';
    this.description = '';
    this.justification = '';
    this.estimatedCost = null;
    this.close();
  }
}
