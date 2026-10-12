import { User } from './user.model';

export type RequestType = 
  | 'compra' 
  | 'permiso' 
  | 'acceso_sistemas' 
  | 'modificacion_proceso' 
  | 'presupuesto' 
  | 'mantenimiento'
  | 'soporte';

export type RequestStatus = 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'changes_requested';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface OperationRequest {
  id: string;
  code: string; // ej: REQ-204
  title: string;
  description: string;
  requesterId: string;
  requester?: User;
  approverId?: string;
  approver?: User;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  estimatedCost?: number;
  currency?: string;
  justification: string;
  submittedAt: string;
  reviewedAt?: string;
  approvalNotes?: string;
  attachmentsCount?: number;
}
