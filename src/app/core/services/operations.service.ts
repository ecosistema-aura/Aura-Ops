import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { OperationRequest, RequestStatus } from '../models/request.model';
import { InternalProcess } from '../models/process.model';
import { DashboardMetrics } from '../models/stats.model';

const STORAGE_KEY_PREFIX = 'aura_ops_';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  // Signals principales
  readonly users = signal<User[]>(this.loadInitialUsers());
  readonly tasks = signal<Task[]>(this.loadInitialTasks());
  readonly requests = signal<OperationRequest[]>(this.loadInitialRequests());
  readonly processes = signal<InternalProcess[]>(this.loadInitialProcesses());

  // Métricas computadas en tiempo real
  readonly metrics = computed<DashboardMetrics>(() => {
    const allTasks = this.tasks();
    const allRequests = this.requests();
    const allProcesses = this.processes();
    const allUsers = this.users();

    const todayStr = new Date().toISOString().split('T')[0];
    
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const blockedTasks = allTasks.filter(t => t.status === 'blocked').length;
    const pendingApprovals = allRequests.filter(r => r.status === 'pending_approval').length;
    
    // Tareas vencidas (no completadas y con fecha anterior a hoy)
    const overdueTasks = allTasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr).length;
    
    // Asuntos urgentes (tareas urgentes no completadas o solicitudes urgentes pendientes)
    const urgentTasks = allTasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;
    const urgentRequests = allRequests.filter(r => r.status === 'pending_approval' && r.priority === 'urgent').length;

    // Tasa de cumplimiento a tiempo
    const nonDraftTasks = allTasks.filter(t => t.status === 'completed');
    const onTimeCompleted = nonDraftTasks.filter(t => !t.completedAt || t.completedAt.split('T')[0] <= t.dueDate).length;
    const onTimeDeliveryRate = nonDraftTasks.length > 0 
      ? Math.round((onTimeCompleted / nonDraftTasks.length) * 100) 
      : 92;

    return {
      totalTasks: allTasks.length,
      completedTasks,
      pendingTasks,
      blockedTasks,
      pendingApprovals,
      onTimeDeliveryRate,
      overdueTasksCount: overdueTasks,
      urgentIssuesCount: urgentTasks + urgentRequests,
      activeProcessesCount: allProcesses.filter(p => p.status === 'active').length,
      activeTeamMembersCount: allUsers.length
    };
  });

  // Tareas enriquecidas con su usuario asignado
  readonly enrichedTasks = computed(() => {
    const userMap = new Map(this.users().map(u => [u.id, u]));
    return this.tasks().map(task => ({
      ...task,
      assignee: userMap.get(task.assigneeId)
    }));
  });

  // Solicitudes enriquecidas con solicitante y aprobador
  readonly enrichedRequests = computed(() => {
    const userMap = new Map(this.users().map(u => [u.id, u]));
    return this.requests().map(req => ({
      ...req,
      requester: userMap.get(req.requesterId),
      approver: req.approverId ? userMap.get(req.approverId) : undefined
    }));
  });

  // Procesos enriquecidos con su líder/owner
  readonly enrichedProcesses = computed(() => {
    const userMap = new Map(this.users().map(u => [u.id, u]));
    return this.processes().map(proc => ({
      ...proc,
      owner: userMap.get(proc.ownerId)
    }));
  });

  constructor() {
    // Escuchar cambios y sincronizar en LocalStorage
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch {
      // Ignorar error si almacenamiento restringido
    }
  }

  // --- GESTIÓN DE TAREAS ---
  addTask(taskData: Omit<Task, 'id' | 'code' | 'createdAt'>): Task {
    const currentTasks = this.tasks();
    const nextNum = currentTasks.length + 101;
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now(),
      code: `OPS-${nextNum}`,
      createdAt: new Date().toISOString(),
      checklist: taskData.checklist || []
    };
    
    const updated = [newTask, ...currentTasks];
    this.tasks.set(updated);
    this.saveToStorage('tasks', updated);
    return newTask;
  }

  updateTask(id: string, partial: Partial<Task>): void {
    const updated = this.tasks().map(t => {
      if (t.id === id) {
        const isCompleting = partial.status === 'completed' && t.status !== 'completed';
        return {
          ...t,
          ...partial,
          completedAt: isCompleting ? new Date().toISOString() : partial.completedAt ?? t.completedAt
        };
      }
      return t;
    });
    this.tasks.set(updated);
    this.saveToStorage('tasks', updated);
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  deleteTask(id: string): void {
    const updated = this.tasks().filter(t => t.id !== id);
    this.tasks.set(updated);
    this.saveToStorage('tasks', updated);
  }

  toggleTaskChecklist(taskId: string, checkId: string): void {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return;

    const newChecklist = task.checklist.map(c => 
      c.id === checkId ? { ...c, done: !c.done } : c
    );

    this.updateTask(taskId, { checklist: newChecklist });
  }

  // --- GESTIÓN DE SOLICITUDES & APROBACIONES ---
  addRequest(reqData: Omit<OperationRequest, 'id' | 'code' | 'submittedAt' | 'status'>): OperationRequest {
    const current = this.requests();
    const nextNum = current.length + 201;
    const newReq: OperationRequest = {
      ...reqData,
      id: 'req_' + Date.now(),
      code: `REQ-${nextNum}`,
      status: 'pending_approval',
      submittedAt: new Date().toISOString()
    };

    const updated = [newReq, ...current];
    this.requests.set(updated);
    this.saveToStorage('requests', updated);
    return newReq;
  }

  reviewRequest(
    id: string, 
    status: RequestStatus, 
    approverId: string, 
    approvalNotes: string
  ): void {
    const updated = this.requests().map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          approverId,
          approvalNotes,
          reviewedAt: new Date().toISOString()
        };
      }
      return r;
    });
    this.requests.set(updated);
    this.saveToStorage('requests', updated);
  }

  // --- GESTIÓN DE PROCESOS INTERNOS ---
  addProcess(procData: Omit<InternalProcess, 'id' | 'code'>): InternalProcess {
    const current = this.processes();
    const nextNum = current.length + 1;
    const newProc: InternalProcess = {
      ...procData,
      id: 'proc_' + Date.now(),
      code: `PRC-0${nextNum}`
    };

    const updated = [newProc, ...current];
    this.processes.set(updated);
    this.saveToStorage('processes', updated);
    return newProc;
  }

  updateProcess(id: string, partial: Partial<InternalProcess>): void {
    const updated = this.processes().map(p => p.id === id ? { ...p, ...partial } : p);
    this.processes.set(updated);
    this.saveToStorage('processes', updated);
  }

  // --- USUARIOS / EQUIPO ---
  addUser(userData: Omit<User, 'id'>): User {
    const current = this.users();
    const newUser: User = {
      ...userData,
      id: 'usr_' + Date.now()
    };
    const updated = [...current, newUser];
    this.users.set(updated);
    this.saveToStorage('users', updated);
    return newUser;
  }

  // --- RESET DEMO DATA ---
  resetAllToDemoData(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'tasks');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'requests');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'processes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'users');

    this.users.set(this.getDemoUsers());
    this.tasks.set(this.getDemoTasks());
    this.requests.set(this.getDemoRequests());
    this.processes.set(this.getDemoProcesses());
  }

  // --- CARGA INICIAL Y DATOS DEMO ---
  private loadInitialUsers(): User[] {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return this.getDemoUsers();
  }

  private loadInitialTasks(): Task[] {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return this.getDemoTasks();
  }

  private loadInitialRequests(): OperationRequest[] {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'requests');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return this.getDemoRequests();
  }

  private loadInitialProcesses(): InternalProcess[] {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'processes');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return this.getDemoProcesses();
  }

  private getDemoUsers(): User[] {
    return [
      {
        id: 'u1',
        name: 'Sofía Morales',
        email: 'sofia.morales@aura.io',
        initials: 'SM',
        role: 'Líder de Operaciones',
        department: 'Operaciones',
        avatarColor: 'bg-slate-700 text-slate-100',
        activeTasksCount: 4,
        completedTasksCount: 18
      },
      {
        id: 'u2',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@aura.io',
        initials: 'CM',
        role: 'Supervisor',
        department: 'Logística',
        avatarColor: 'bg-sky-800 text-sky-100',
        activeTasksCount: 3,
        completedTasksCount: 12
      },
      {
        id: 'u3',
        name: 'Mariana Silva',
        email: 'mariana.silva@aura.io',
        initials: 'MS',
        role: 'Auditor',
        department: 'Calidad y Cumplimiento',
        avatarColor: 'bg-emerald-800 text-emerald-100',
        activeTasksCount: 2,
        completedTasksCount: 15
      },
      {
        id: 'u4',
        name: 'Andrés Rivas',
        email: 'andres.rivas@aura.io',
        initials: 'AR',
        role: 'Operador',
        department: 'TI & Sistemas',
        avatarColor: 'bg-indigo-800 text-indigo-100',
        activeTasksCount: 5,
        completedTasksCount: 22
      },
      {
        id: 'u5',
        name: 'Elena Vega',
        email: 'elena.vega@aura.io',
        initials: 'EV',
        role: 'Operador',
        department: 'Operaciones',
        avatarColor: 'bg-amber-800 text-amber-100',
        activeTasksCount: 3,
        completedTasksCount: 9
      },
      {
        id: 'u6',
        name: 'Diego Herrera',
        email: 'diego.herrera@aura.io',
        initials: 'DH',
        role: 'Gerente',
        department: 'Finanzas',
        avatarColor: 'bg-purple-800 text-purple-100',
        activeTasksCount: 1,
        completedTasksCount: 31
      }
    ];
  }

  private getDemoTasks(): Task[] {
    const now = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    return [
      {
        id: 't1',
        code: 'OPS-101',
        title: 'Mantenimiento preventivo de servidores perimetrales',
        description: 'Revisión técnica de ventilación, backup de imágenes de recuperación y verificación de latencias operativas.',
        assigneeId: 'u4',
        reporterId: 'u1',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Mantenimiento',
        dueDate: formatDate(0), // Hoy
        estimatedHours: 4,
        tags: ['Infraestructura', 'Alta Prioridad'],
        checklist: [
          { id: 'c1', text: 'Backup de snapshots', done: true },
          { id: 'c2', text: 'Limpieza de filtros y verificación térmica', done: true },
          { id: 'c3', text: 'Pruebas de conmutación por fallo', done: false }
        ],
        processId: 'p3',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 't2',
        code: 'OPS-102',
        title: 'Auditoría de inventario físico en nave central',
        description: 'Cotejo entre stock reportado en ERP y existencias físicas en bahías A3 a B8.',
        assigneeId: 'u2',
        reporterId: 'u1',
        status: 'pending',
        priority: 'high',
        category: 'Logística',
        dueDate: formatDate(1), // Mañana
        estimatedHours: 6,
        tags: ['Inventario', 'Planta'],
        checklist: [
          { id: 'c4', text: 'Impresión de hojas de recuento ciego', done: true },
          { id: 'c5', text: 'Conteo físico de bahías A3-A8', done: false },
          { id: 'c6', text: 'Validación con jefe de almacén', done: false }
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 't3',
        code: 'OPS-103',
        title: 'Revisión y actualización de matriz SOP-QA-04',
        description: 'Actualizar protocolo estándar de inspección de recepción para ajustarlo a la nueva norma técnica.',
        assigneeId: 'u3',
        reporterId: 'u6',
        status: 'in_review',
        priority: 'medium',
        category: 'Auditoría',
        dueDate: formatDate(3),
        estimatedHours: 8,
        tags: ['Calidad', 'Normativa'],
        checklist: [
          { id: 'c7', text: 'Revisión de cambios regulatorios', done: true },
          { id: 'c8', text: 'Redacción de anexo técnico', done: true },
          { id: 'c9', text: 'Firma de aprobación de gerencia', done: false }
        ],
        processId: 'p4',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 't4',
        code: 'OPS-104',
        title: 'Recepción y calibración de nuevos escáneres ópticos',
        description: 'Configuración de red, emparejamiento con terminales móviles y capacitación breve a operadores de turno.',
        assigneeId: 'u5',
        reporterId: 'u2',
        status: 'blocked',
        priority: 'high',
        category: 'Procesos',
        dueDate: formatDate(-1), // Vencida
        estimatedHours: 3,
        tags: ['Equipamiento', 'Bloqueado por TI'],
        checklist: [
          { id: 'c10', text: 'Desempaque y registro de números de serie', done: true },
          { id: 'c11', text: 'Instalación de firmware corporativo v4.2', done: false }
        ],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 't5',
        code: 'OPS-105',
        title: 'Cierre de reporte operativo semanal Q3-W41',
        description: 'Consolidación de indicadores de eficiencia de línea, incidentes menores y tiempos de respuesta de soporte.',
        assigneeId: 'u1',
        reporterId: 'u6',
        status: 'completed',
        priority: 'medium',
        category: 'Documentación',
        dueDate: formatDate(-2),
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        estimatedHours: 5,
        tags: ['Reportes', 'Gerencia'],
        checklist: [
          { id: 'c12', text: 'Cierre de métricas en dashboard', done: true },
          { id: 'c13', text: 'Envío de resumen ejecutivo por email', done: true }
        ],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 't6',
        code: 'OPS-106',
        title: 'Capacitación en protocolo de seguridad de datos para nuevo personal',
        description: 'Sesión teórica y práctica sobre manejo de contraseñas, doble factor y clasificación de datos de operaciones.',
        assigneeId: 'u4',
        reporterId: 'u1',
        status: 'pending',
        priority: 'low',
        category: 'Soporte',
        dueDate: formatDate(5),
        estimatedHours: 2,
        tags: ['Capacitación', 'Seguridad'],
        checklist: [
          { id: 'c14', text: 'Preparar diapositivas actualizadas', done: true },
          { id: 'c15', text: 'Emitir constancias de participación', done: false }
        ],
        processId: 'p1',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private getDemoRequests(): OperationRequest[] {
    return [
      {
        id: 'r1',
        code: 'REQ-201',
        title: 'Ampliación de licencia de monitoreo de servidores (Datadog/Opsgenie)',
        description: 'Se requiere cubrir 6 nodos adicionales integrados en la nave logística central para alarmas tempranas.',
        requesterId: 'u4',
        approverId: 'u6',
        type: 'presupuesto',
        priority: 'urgent',
        status: 'pending_approval',
        estimatedCost: 1450,
        currency: 'USD',
        justification: 'Evitar fallas imprevistas no alertadas durante turnos nocturnos de alta demanda.',
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        attachmentsCount: 2
      },
      {
        id: 'r2',
        code: 'REQ-202',
        title: 'Permiso especial de acceso a zona de racks de telecomunicaciones',
        description: 'Ingreso técnico para contratista externo de fibra óptica para empalme de redundancia.',
        requesterId: 'u2',
        approverId: 'u1',
        type: 'acceso_sistemas',
        priority: 'high',
        status: 'pending_approval',
        justification: 'Trabajo programado el fin de semana para minimizar cualquier impacto en la operación regular.',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        attachmentsCount: 1
      },
      {
        id: 'r3',
        code: 'REQ-203',
        title: 'Reposición de equipos de protección personal (EPP) nivel 2',
        description: 'Lote de 20 cascos ergonómicos dieléctricos y guantes reforzados para equipo de operaciones de campo.',
        requesterId: 'u5',
        approverId: 'u6',
        type: 'compra',
        priority: 'medium',
        status: 'approved',
        estimatedCost: 890,
        currency: 'USD',
        justification: 'Vencimiento semestral de lotes de protección obligatorios por normativa de seguridad laboral.',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        approvalNotes: 'Aprobado con cargo a la partida de seguridad ocupacional Q3.',
        attachmentsCount: 3
      },
      {
        id: 'r4',
        code: 'REQ-204',
        title: 'Ajuste en la ventana horaria de sincronización nocturna de bases de datos',
        description: 'Modificar la hora de ejecución del cron job de las 02:00 a las 03:30 para no colisionar con el cierre de caja de logística.',
        requesterId: 'u1',
        type: 'modificacion_proceso',
        priority: 'medium',
        status: 'changes_requested',
        justification: 'El proceso actual genera un bloqueo temporal de tablas durante el balance nocturno.',
        submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        approverId: 'u4',
        approvalNotes: 'Por favor adjuntar reporte de carga de CPU estimado durante esa nueva franja.',
        attachmentsCount: 1
      }
    ];
  }

  private getDemoProcesses(): InternalProcess[] {
    return [
      {
        id: 'p1',
        code: 'PRC-01',
        title: 'Onboarding Operativo y Habilitación de Puesto',
        description: 'Flujo estándar de inducción técnica, asignación de credenciales, entrega de equipo y evaluación de primeros 30 días.',
        ownerId: 'u1',
        department: 'Operaciones & RRHH',
        status: 'active',
        targetDays: 7,
        activeInstances: 3,
        complianceRate: 95,
        lastAuditDate: '2026-09-28',
        sopDocumentCode: 'SOP-OPS-001-v3',
        stages: [
          { id: 's1', name: 'Gestión de Credenciales & Acceso', description: 'Alta en directorios, asignación de VPN y roles', order: 1, totalChecks: 4, completedChecks: 4, responsibleRole: 'TI & Sistemas' },
          { id: 's2', name: 'Entrega de Herramientas y EPP', description: 'Firma de acta de entrega y chequeo de equipo', order: 2, totalChecks: 3, completedChecks: 3, responsibleRole: 'Logística' },
          { id: 's3', name: 'Capacitación en Protocolos SOP', description: 'Revisión de normativas y pruebas de conocimiento', order: 3, totalChecks: 5, completedChecks: 4, responsibleRole: 'Supervisor' },
          { id: 's4', name: 'Evaluación de Salida y Firma Final', description: 'Validación por el líder de operaciones', order: 4, totalChecks: 2, completedChecks: 1, responsibleRole: 'Líder de Operaciones' }
        ]
      },
      {
        id: 'p2',
        code: 'PRC-02',
        title: 'Recepción y Validación de Despachos Críticos',
        description: 'Verificación de trazabilidad, control de temperatura/embalaje y registro digital de conformidad.',
        ownerId: 'u2',
        department: 'Logística',
        status: 'active',
        targetDays: 1,
        activeInstances: 8,
        complianceRate: 98,
        lastAuditDate: '2026-10-02',
        sopDocumentCode: 'SOP-LOG-014-v2',
        stages: [
          { id: 's5', name: 'Inspección Perimetral y Precintos', description: 'Verificación de integridad física del transporte', order: 1, totalChecks: 3, completedChecks: 3, responsibleRole: 'Operador' },
          { id: 's6', name: 'Cotejo contra Guía de Remisión', description: 'Escaneo de códigos de barra y número de bultos', order: 2, totalChecks: 4, completedChecks: 4, responsibleRole: 'Supervisor' },
          { id: 's7', name: 'Ingreso al Sistema Central', description: 'Carga de stock en tiempo real y cierre de remisión', order: 3, totalChecks: 2, completedChecks: 2, responsibleRole: 'Operador' }
        ]
      },
      {
        id: 'p3',
        code: 'PRC-03',
        title: 'Mantenimiento Preventivo de Infraestructura',
        description: 'Régimen quincenal de revisión de instalaciones, generadores de respaldo y cableado estructurado.',
        ownerId: 'u4',
        department: 'TI & Mantenimiento',
        status: 'active',
        targetDays: 3,
        activeInstances: 2,
        complianceRate: 91,
        lastAuditDate: '2026-09-15',
        sopDocumentCode: 'SOP-MNT-008-v4',
        stages: [
          { id: 's8', name: 'Diagnóstico Previo y Telemetría', description: 'Revisión de logs de sensores y alertas tempranas', order: 1, totalChecks: 4, completedChecks: 3, responsibleRole: 'TI & Sistemas' },
          { id: 's9', name: 'Intervención en Sitio', description: 'Ejecución de checklist físico de mantenimiento', order: 2, totalChecks: 6, completedChecks: 4, responsibleRole: 'Operador Senior' },
          { id: 's10', name: 'Pruebas de Carga y Certificación', description: 'Simulación de estrés y aprobación de retorno a operación', order: 3, totalChecks: 3, completedChecks: 1, responsibleRole: 'Líder de Operaciones' }
        ]
      },
      {
        id: 'p4',
        code: 'PRC-04',
        title: 'Auditoría Mensual de Calidad y Cumplimiento',
        description: 'Inspección aleatoria de procesos, verificación de evidencias y levantamiento de no conformidades.',
        ownerId: 'u3',
        department: 'Calidad y Cumplimiento',
        status: 'active',
        targetDays: 5,
        activeInstances: 1,
        complianceRate: 100,
        lastAuditDate: '2026-10-01',
        sopDocumentCode: 'SOP-QA-002-v5',
        stages: [
          { id: 's11', name: 'Muestreo y Solicitud de Evidencias', description: 'Selección de 25 casos operacionales del periodo', order: 1, totalChecks: 3, completedChecks: 3, responsibleRole: 'Auditor' },
          { id: 's12', name: 'Evaluación de Criterios de Aceptación', description: 'Contraste contra indicadores clave de desempeño', order: 2, totalChecks: 5, completedChecks: 3, responsibleRole: 'Auditor' },
          { id: 's13', name: 'Informe y Plan de Acción Correctivo', description: 'Presentación formal ante comité gerencial', order: 3, totalChecks: 3, completedChecks: 1, responsibleRole: 'Gerente' }
        ]
      }
    ];
  }
}
