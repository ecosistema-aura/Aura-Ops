import { User } from './user.model';

export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'Procesos' | 'Logística' | 'Mantenimiento' | 'Auditoría' | 'Soporte' | 'Documentación';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  code: string; // ej: OPS-101
  title: string;
  description: string;
  assigneeId: string;
  assignee?: User;
  reporterId: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  estimatedHours?: number;
  tags: string[];
  checklist: ChecklistItem[];
  processId?: string;
  createdAt: string;
  completedAt?: string;
  commentsCount?: number;
}
