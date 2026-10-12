export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  pendingApprovals: number;
  onTimeDeliveryRate: number; // porcentaje 0 - 100
  overdueTasksCount: number;
  urgentIssuesCount: number;
  activeProcessesCount: number;
  activeTeamMembersCount: number;
}
