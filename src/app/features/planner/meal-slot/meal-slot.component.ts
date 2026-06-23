import { Component, input, output } from '@angular/core';

import { Recipe } from '../../../models/meal.models';

@Component({
  selector: 'app-meal-slot',
  templateUrl: './meal-slot.component.html',
  styleUrl: './meal-slot.component.scss',
})
export class MealSlotComponent {
  readonly recipe = input<Recipe | undefined>();
  readonly selected = input(false);
  readonly recipeSelect = output<string>();

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  onFilledSlotClick(recipe: Recipe): void {
    this.recipeSelect.emit(recipe.id);
  }
}
