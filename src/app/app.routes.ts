import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent)
  },
  {
    path: 'approvals',
    loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent)
  },
  {
    path: 'deadlines',
    loadComponent: () => import('./features/deadlines/deadlines.component').then(m => m.DeadlinesComponent)
  },
  {
    path: 'processes',
    loadComponent: () => import('./features/processes/processes.component').then(m => m.ProcessesComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
