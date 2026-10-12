import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../core/services/operations.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-14 bg-[#0B192C] border-b border-[#1E3756] px-6 flex items-center justify-between sticky top-0 z-20">
      <!-- Section info -->
      <div>
        <h1 class="text-xs font-semibold text-white tracking-tight">{{ title }}</h1>
      </div>

      <!-- Actions with high contrast -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="onNewRequest.emit()"
          class="text-xs px-2.5 py-1 text-slate-200 bg-[#152B44] hover:bg-[#1C3656] hover:text-white border border-[#1E3756] rounded transition-colors"
        >
          + Solicitud
        </button>
        <button
          type="button"
          (click)="onNewTask.emit()"
          class="text-xs px-2.5 py-1 text-[#0B192C] bg-white hover:bg-slate-100 font-semibold rounded shadow-xs transition-colors"
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
