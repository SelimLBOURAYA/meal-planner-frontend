import { Component, inject } from '@angular/core';

import { Recipe } from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';

@Component({
  selector: 'app-recipe-panel',
  templateUrl: './recipe-panel.component.html',
  styleUrl: './recipe-panel.component.scss',
})
export class RecipePanelComponent {
  private readonly planner = inject(MealPlannerService);

  readonly selectedRecipe = this.planner.selectedRecipe;

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }
}
