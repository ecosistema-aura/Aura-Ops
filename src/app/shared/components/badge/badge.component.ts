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
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-normal border transition-colors"
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

      case 'pending_approval': return 'Por aprobar';
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
        return 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60';
      case 'in_progress':
        return 'text-sky-300 bg-sky-950/50 border-sky-800/60';
      case 'in_review':
      case 'pending_approval':
      case 'medium':
        return 'text-amber-300 bg-amber-950/50 border-amber-800/60';
      case 'urgent':
      case 'blocked':
      case 'rejected':
        return 'text-rose-300 bg-rose-950/50 border-rose-800/60';
      case 'high':
      case 'changes_requested':
        return 'text-amber-400 bg-amber-950/40 border-amber-700/60';
      default:
        return 'text-slate-300 bg-slate-800/60 border-slate-700/60';
    }
  }

  get dotClasses(): string {
    switch (this.value) {
      case 'completed':
      case 'approved':
        return 'bg-emerald-400';
      case 'in_progress':
        return 'bg-sky-400';
      case 'in_review':
      case 'pending_approval':
      case 'medium':
        return 'bg-amber-400';
      case 'urgent':
      case 'blocked':
      case 'rejected':
        return 'bg-rose-400';
      case 'high':
      case 'changes_requested':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  }
}
