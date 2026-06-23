import { Injectable, computed, signal } from '@angular/core';

import {
  formatWeekRange,
  generateStubPlan,
  getMondayOfWeek,
  STUB_RECIPES,
  toDateKey,
} from '../data/stub.data';
import { MealType, PlannedMeal, Recipe, WeekStats } from '../models/meal.models';

const MAX_WEEK_SLOTS = 14;

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

  readonly weekLabel = computed(() => {
    const monday = this.getMondayOfCurrentWeek();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return formatWeekRange(monday, sunday);
  });

  readonly weekStats = computed((): WeekStats => {
    const dateKeys = new Set(this.getWeekDateKeys());
    const weekMeals = this.plannedMeals().filter((meal) =>
      dateKeys.has(meal.date),
    );

    const uniqueRecipeIds = new Set(weekMeals.map((meal) => meal.recipeId));
    let totalCalories = 0;

    for (const meal of weekMeals) {
      const recipe = this.getRecipe(meal.recipeId);
      if (recipe) {
        totalCalories += recipe.calories;
      }
    }

    const plannedCount = weekMeals.length;

    return {
      plannedCount,
      maxSlots: MAX_WEEK_SLOTS,
      uniqueRecipes: uniqueRecipeIds.size,
      avgCaloriesPerMeal:
        plannedCount > 0 ? Math.round(totalCalories / plannedCount) : 0,
      totalCalories,
    };
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

  previousWeek(): void {
    this.weekOffset.update((offset) => offset - 1);
    this.selectRecipe(null);
  }

  nextWeek(): void {
    this.weekOffset.update((offset) => offset + 1);
    this.selectRecipe(null);
  }

  goToCurrentWeek(): void {
    this.weekOffset.set(0);
    this.selectRecipe(null);
  }

  getMondayOfCurrentWeek(referenceDate: Date = new Date()): Date {
    return getMondayOfWeek(referenceDate, this.weekOffset());
  }

  getWeekDateKeys(referenceDate: Date = new Date()): string[] {
    const monday = getMondayOfWeek(referenceDate, this.weekOffset());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return toDateKey(date);
    });
  }
}
