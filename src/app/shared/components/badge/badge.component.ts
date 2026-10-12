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
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight border transition-colors"
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
      // Task Statuses
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Curso';
      case 'in_review': return 'En Revisión';
      case 'completed': return 'Completada';
      case 'blocked': return 'Bloqueada';

      // Priorities
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';

      // Request Statuses
      case 'pending_approval': return 'Pendiente de Aprobación';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'changes_requested': return 'Requiere Cambios';

      default: return this.value;
    }
  }

  get classes(): string {
    // Subtle, sober palette (neutral borders, desaturated backgrounds)
    switch (this.value) {
      // Completed / Approved
      case 'completed':
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      
      // In Progress / Active
      case 'in_progress':
        return 'bg-sky-50 text-sky-800 border-sky-200/80';

      // In Review / Medium / Pending Approval
      case 'in_review':
      case 'pending_approval':
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';

      // Urgent / Blocked / Rejected
      case 'urgent':
      case 'blocked':
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200/80';

      // High priority / Changes Requested
      case 'high':
      case 'changes_requested':
        return 'bg-orange-50 text-orange-800 border-orange-200/80';

      // Low priority / Pending
      case 'low':
      case 'pending':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
        return 'bg-orange-500';
      default:
        return 'bg-slate-400';
    }
  }
}
