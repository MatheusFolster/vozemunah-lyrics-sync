import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'tracks/:id/edit',
    loadComponent: () =>
      import('./features/editor/editor.component')  // ← atualizado
        .then(m => m.EditorComponent)
  },
  { path: '**', redirectTo: '' }
];