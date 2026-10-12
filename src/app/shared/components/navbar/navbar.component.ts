import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../core/services/operations.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <!-- Section info -->
      <div>
        <h1 class="text-xs font-semibold text-[#0B192C] tracking-tight">{{ title }}</h1>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="onNewRequest.emit()"
          class="text-xs px-2.5 py-1 text-slate-600 hover:text-[#0B192C] hover:bg-[#F0F4F8] border border-slate-200 rounded transition-colors"
        >
          + Solicitud
        </button>
        <button
          type="button"
          (click)="onNewTask.emit()"
          class="text-xs px-2.5 py-1 text-white bg-[#0B192C] hover:bg-[#142842] rounded shadow-2xs transition-colors"
        >
          + Tarea
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() title: string = 'Operaciones';
  @Input() subtitle: string = '';
  @Output() onNewTask = new EventEmitter<void>();
  @Output() onNewRequest = new EventEmitter<void>();

  readonly opsService = inject(OperationsService);
}
