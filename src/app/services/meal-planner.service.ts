import { Injectable, computed, signal } from '@angular/core';

import {
  generateStubPlan,
  getMondayOfWeek,
  STUB_RECIPES,
} from '../data/stub.data';
import { MealType, PlannedMeal, Recipe } from '../models/meal.models';

@Injectable({ providedIn: 'root' })
export class MealPlannerService {
  readonly weekOffset = signal(0);
  readonly selectedRecipeId = signal<string | null>(null);
  readonly recipes = signal<Recipe[]>(STUB_RECIPES);
  readonly plannedMeals = signal<PlannedMeal[]>(
    generateStubPlan(new Date()),
  );

  readonly selectedRecipe = computed(() => {
    const recipeId = this.selectedRecipeId();
    return recipeId ? this.getRecipe(recipeId) : undefined;
  });

  getRecipe(id: string): Recipe | undefined {
    return this.recipes().find((recipe) => recipe.id === id);
  }

  getMealForSlot(dateKey: string, mealType: MealType): PlannedMeal | undefined {
    return this.plannedMeals().find(
      (meal) => meal.date === dateKey && meal.mealType === mealType,
    );
  }

  selectRecipe(recipeId: string | null): void {
    this.selectedRecipeId.set(recipeId);
  }

  getMondayOfCurrentWeek(referenceDate: Date = new Date()): Date {
    return getMondayOfWeek(referenceDate, this.weekOffset());
  }
}
