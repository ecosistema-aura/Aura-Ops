import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../core/services/operations.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-[#0B192C] border-b border-[#1E3756] px-8 flex items-center justify-between sticky top-0 z-20">
      <!-- Section Title -->
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-white tracking-tight uppercase tracking-wider text-xs">{{ title }}</h1>
      </div>

      <!-- Actions with high contrast and enlarged size -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="onNewRequest.emit()"
          class="text-xs px-3.5 py-1.5 text-slate-200 bg-[#152B44] hover:bg-[#1C3656] hover:text-white border border-[#1E3756] rounded-md transition-colors font-medium"
        >
          + Solicitud
        </button>
        <button
          type="button"
          (click)="onNewTask.emit()"
          class="text-xs px-3.5 py-1.5 text-[#0B192C] bg-white hover:bg-slate-100 font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Tarea</span>
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
