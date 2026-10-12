import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { RequestStatus } from '../../../core/models/request.model';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-normal tracking-normal transition-colors"
      [ngClass]="classes"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClasses"></span>
      {{ label }}
    </span>
  `
})
export class BadgeComponent {
  @Input() type: 'task-status' | 'priority' | 'request-status' | 'custom' = 'task-status';
  @Input() value: TaskStatus | TaskPriority | RequestStatus | string = '';

  get label(): string {
    switch (this.value) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En curso';
      case 'in_review': return 'Revisión';
      case 'completed': return 'Completada';
      case 'blocked': return 'Bloqueada';

      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';

      case 'pending_approval': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'changes_requested': return 'Observada';

      default: return this.value;
    }
  }

  get classes(): string {
    switch (this.value) {
      case 'completed':
      case 'approved':
        return 'text-emerald-700 bg-emerald-50/80';
      case 'in_progress':
        return 'text-sky-700 bg-sky-50/80';
      case 'in_review':
      case 'pending_approval':
      case 'medium':
        return 'text-amber-700 bg-amber-50/80';
      case 'urgent':
      case 'blocked':
      case 'rejected':
        return 'text-rose-700 bg-rose-50/80';
      case 'high':
      case 'changes_requested':
        return 'text-amber-800 bg-amber-50/80';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  }

  get dotClasses(): string {
    switch (this.value) {
      case 'completed':
      case 'approved':
        return 'bg-emerald-500';
      case 'in_progress':
        return 'bg-sky-500';
      case 'in_review':
      case 'pending_approval':
      case 'medium':
        return 'bg-amber-500';
      case 'urgent':
      case 'blocked':
      case 'rejected':
        return 'bg-rose-500';
      case 'high':
      case 'changes_requested':
        return 'bg-amber-600';
      default:
        return 'bg-slate-400';
    }
  }
}
