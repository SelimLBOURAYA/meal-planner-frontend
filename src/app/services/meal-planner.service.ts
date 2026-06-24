import { Injectable, computed, signal } from '@angular/core';

import {
  formatWeekRange,
  generateStubPlan,
  getMondayOfWeek,
  STUB_RECIPES,
  toDateKey,
} from '../data/stub.data';
import {
  Ingredient,
  MealType,
  PlannedMeal,
  Recipe,
  ShoppingListItem,
  WeekStats,
} from '../models/meal.models';

const MAX_WEEK_SLOTS = 14;

@Injectable({ providedIn: 'root' })
export class MealPlannerService {
  readonly weekOffset = signal(0);
  readonly selectedRecipeId = signal<string | null>(null);
  readonly recipes = signal<Recipe[]>(STUB_RECIPES);
  readonly plannedMeals = signal<PlannedMeal[]>(
    generateStubPlan(new Date()),
  );
  readonly shoppingCheckedIds = signal<Set<string>>(new Set());
  private readonly ephemeralRecipes = signal<Map<string, Recipe>>(new Map());

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

  readonly shoppingList = computed((): ShoppingListItem[] => {
    const dateKeys = new Set(this.getWeekDateKeys());
    const recipeIds = this.plannedMeals()
      .filter((meal) => dateKeys.has(meal.date))
      .map((meal) => meal.recipeId);
    const checkedIds = this.shoppingCheckedIds();
    const aggregated = this.aggregateIngredients(recipeIds);

    return aggregated.map((item) => ({
      ...item,
      checked: checkedIds.has(item.id),
    }));
  });

  readonly shoppingListProgress = computed(() => {
    const items = this.shoppingList();
    const checkedCount = items.filter((item) => item.checked).length;

    return {
      checked: checkedCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0,
    };
  });

  getRecipe(id: string): Recipe | undefined {
    return (
      this.recipes().find((recipe) => recipe.id === id) ??
      this.ephemeralRecipes().get(id)
    );
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

  aggregateIngredients(recipeIds: string[]): Omit<ShoppingListItem, 'checked'>[] {
    const merged = new Map<string, Ingredient>();

    for (const recipeId of recipeIds) {
      const recipe = this.getRecipe(recipeId);
      if (!recipe) {
        continue;
      }

      for (const ingredient of recipe.ingredients) {
        const key = this.ingredientKey(ingredient.name, ingredient.unit);
        const existing = merged.get(key);

        if (existing) {
          existing.quantity += ingredient.quantity;
        } else {
          merged.set(key, { ...ingredient });
        }
      }
    }

    return Array.from(merged.entries())
      .map(([id, ingredient]) => ({
        id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  assignApiRecipe(
    dateKey: string,
    mealType: MealType,
    recipe: Recipe,
    saveToCatalog: boolean,
  ): void {
    if (saveToCatalog) {
      if (!this.recipes().some((item) => item.id === recipe.id)) {
        this.recipes.update((recipes) => [...recipes, recipe]);
      }
    } else {
      this.ephemeralRecipes.update((recipes) => {
        const next = new Map(recipes);
        next.set(recipe.id, recipe);
        return next;
      });
    }

    this.assignMeal(dateKey, mealType, recipe.id);
  }

  assignMeal(dateKey: string, mealType: MealType, recipeId: string): void {
    const meal: PlannedMeal = {
      id: `planned-${dateKey}-${mealType}`,
      date: dateKey,
      mealType,
      recipeId,
    };

    const existing = this.getMealForSlot(dateKey, mealType);

    if (existing) {
      this.plannedMeals.update((meals) =>
        meals.map((item) => (item.id === existing.id ? meal : item)),
      );
    } else {
      this.plannedMeals.update((meals) => [...meals, meal]);
    }

    this.selectRecipe(recipeId);
  }

  removeMeal(dateKey: string, mealType: MealType): void {
    const existing = this.getMealForSlot(dateKey, mealType);
    if (!existing) {
      return;
    }

    this.plannedMeals.update((meals) =>
      meals.filter((meal) => meal.id !== existing.id),
    );

    if (this.selectedRecipeId() === existing.recipeId) {
      this.selectRecipe(null);
    }
  }

  addRecipe(recipe: Omit<Recipe, 'id'>): Recipe {
    const newRecipe: Recipe = {
      ...recipe,
      id: this.generateRecipeId(),
    };

    this.recipes.update((recipes) => [...recipes, newRecipe]);
    return newRecipe;
  }

  toggleShoppingItem(itemId: string): void {
    this.shoppingCheckedIds.update((checked) => {
      const next = new Set(checked);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });
  }

  private ingredientKey(name: string, unit: string): string {
    return `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;
  }

  private generateRecipeId(): string {
    const existingIds = new Set(this.recipes().map((recipe) => recipe.id));

    do {
      const id = `recipe-user-${crypto.randomUUID()}`;
      if (!existingIds.has(id)) {
        return id;
      }
    } while (true);
  }
}
