import { Component, input } from '@angular/core';

import { Recipe } from '../../../models/meal.models';

@Component({
  selector: 'app-meal-slot',
  templateUrl: './meal-slot.component.html',
  styleUrl: './meal-slot.component.scss',
})
export class MealSlotComponent {
  readonly recipe = input<Recipe | undefined>();
  readonly selected = input(false);

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }
}
