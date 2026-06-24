import { Component, computed, HostListener, inject, output } from '@angular/core';

import { Ingredient, Recipe } from '../../../models/meal.models';
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
  readonly selectedPlannedMeal = this.planner.selectedPlannedMeal;

  readonly scaledIngredients = computed((): Ingredient[] => {
    const recipe = this.selectedRecipe();
    const meal = this.selectedPlannedMeal();

    if (!recipe || !meal) {
      return recipe?.ingredients ?? [];
    }

    return this.planner.scaledIngredients(recipe, meal.plannedServings);
  });

  readonly scaledCalories = computed(() => {
    const recipe = this.selectedRecipe();
    const meal = this.selectedPlannedMeal();

    if (!recipe) {
      return 0;
    }

    if (!meal) {
      return recipe.calories;
    }

    return this.planner.scaledCalories(recipe, meal.plannedServings);
  });

  readonly servingsLabel = computed(() => {
    const recipe = this.selectedRecipe();
    const meal = this.selectedPlannedMeal();

    if (!recipe || !meal) {
      return `${recipe?.baseServings ?? 1} portions`;
    }

    if (meal.plannedServings === recipe.baseServings) {
      return `${meal.plannedServings} portions`;
    }

    return `${meal.plannedServings} portions (recette pour ${recipe.baseServings})`;
  });

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  canDelete(recipe: Recipe): boolean {
    return this.planner.isDeletableRecipe(recipe.id);
  }

  decrementServings(): void {
    const meal = this.selectedPlannedMeal();
    if (!meal) {
      return;
    }

    this.planner.updatePlannedServings(
      meal.date,
      meal.mealType,
      meal.plannedServings - 1,
    );
  }

  incrementServings(): void {
    const meal = this.selectedPlannedMeal();
    if (!meal) {
      return;
    }

    this.planner.updatePlannedServings(
      meal.date,
      meal.mealType,
      meal.plannedServings + 1,
    );
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
