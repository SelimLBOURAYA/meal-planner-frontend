import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/planner/planner.component').then(
        (m) => m.PlannerComponent,
      ),
  },
  {
    path: 'recipes/new',
    loadComponent: () =>
      import('./features/recipes/recipe-form/recipe-form.component').then(
        (m) => m.RecipeFormComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
