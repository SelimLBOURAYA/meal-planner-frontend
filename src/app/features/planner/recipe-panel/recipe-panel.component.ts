import { Component, HostListener, inject, output } from '@angular/core';

import { Recipe } from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';

@Component({
  selector: 'app-recipe-panel',
  templateUrl: './recipe-panel.component.html',
  styleUrl: './recipe-panel.component.scss',
})
export class RecipePanelComponent {
  private readonly planner = inject(MealPlannerService);

  readonly close = output<void>();
  readonly deleteRecipe = output<string>();

  readonly selectedRecipe = this.planner.selectedRecipe;

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  canDelete(recipe: Recipe): boolean {
    return this.planner.isDeletableRecipe(recipe.id);
  }

  onDelete(recipe: Recipe): void {
    this.deleteRecipe.emit(recipe.id);
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedRecipe()) {
      this.onClose();
    }
  }
}
