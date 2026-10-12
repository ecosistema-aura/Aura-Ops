import { User } from './user.model';

export type ProcessStatus = 'active' | 'in_review' | 'draft' | 'archived';

export interface ProcessStage {
  id: string;
  name: string;
  description: string;
  order: number;
  totalChecks: number;
  completedChecks: number;
  responsibleRole: string;
}

export interface InternalProcess {
  id: string;
  code: string; // ej: PRC-01
  title: string;
  description: string;
  ownerId: string;
  owner?: User;
  department: string;
  status: ProcessStatus;
  targetDays: number;
  stages: ProcessStage[];
  activeInstances: number;
  complianceRate: number; // porcentaje (ej. 94)
  lastAuditDate: string;
  sopDocumentCode: string;
}
