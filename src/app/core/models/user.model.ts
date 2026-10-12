export type UserRole = 'Operador' | 'Supervisor' | 'Líder de Operaciones' | 'Gerente' | 'Auditor';
export type Department = 'Operaciones' | 'Logística' | 'Finanzas' | 'TI & Sistemas' | 'Calidad y Cumplimiento';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  department: Department;
  avatarColor: string;
  activeTasksCount?: number;
  completedTasksCount?: number;
}
