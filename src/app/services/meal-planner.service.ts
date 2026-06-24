import { Injectable, computed, effect, signal } from '@angular/core';

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
  SelectedSlot,
  ShoppingListItem,
  WeekStats,
} from '../models/meal.models';
import {
  ensureUniqueApiRecipeId,
  generateUniqueRecipeId,
  isStubRecipeId,
  mergeCustomRecipes,
  remapConflictingRecipe,
} from './recipe-id.utils';
import { StorageService } from './storage.service';

const MAX_WEEK_SLOTS = 14;

export interface DeleteRecipeResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class MealPlannerService {
  readonly weekOffset = signal(0);
  readonly selectedRecipeId = signal<string | null>(null);
  readonly selectedSlot = signal<SelectedSlot | null>(null);
  readonly recipes = signal<Recipe[]>([...STUB_RECIPES]);
  readonly plannedMeals = signal<PlannedMeal[]>(
    generateStubPlan(new Date()),
  );
  readonly shoppingCheckedIds = signal<Set<string>>(new Set());
  private readonly ephemeralRecipes = signal<Map<string, Recipe>>(new Map());
  private hydrated = false;

  readonly selectedRecipe = computed(() => {
    const recipeId = this.selectedRecipeId();
    return recipeId ? this.getRecipe(recipeId) : undefined;
  });

  readonly selectedPlannedMeal = computed(() => {
    const slot = this.selectedSlot();
    if (!slot) {
      return undefined;
    }

    return this.getMealForSlot(slot.dateKey, slot.mealType);
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
        totalCalories += Math.round(
          recipe.calories * this.getServingScale(recipe, meal.plannedServings),
        );
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
    const weekMeals = this.plannedMeals().filter((meal) =>
      dateKeys.has(meal.date),
    );
    const checkedIds = this.shoppingCheckedIds();
    const aggregated = this.aggregateIngredients(weekMeals);

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

  constructor(private readonly storage: StorageService) {
    this.hydrateFromStorage();
    this.hydrated = true;

    effect(() => {
      if (!this.hydrated) {
        return;
      }

      this.recipes();
      this.ephemeralRecipes();
      this.plannedMeals();
      this.shoppingCheckedIds();
      this.persistState();
    });
  }

  getRecipe(id: string): Recipe | undefined {
    return (
      this.recipes().find((recipe) => recipe.id === id) ??
      this.ephemeralRecipes().get(id)
    );
  }

  isDeletableRecipe(recipeId: string): boolean {
    return !isStubRecipeId(recipeId) && !!this.getRecipe(recipeId);
  }

  getMealForSlot(dateKey: string, mealType: MealType): PlannedMeal | undefined {
    return this.plannedMeals().find(
      (meal) => meal.date === dateKey && meal.mealType === mealType,
    );
  }

  selectRecipe(recipeId: string | null): void {
    this.selectedRecipeId.set(recipeId);

    if (!recipeId) {
      this.selectedSlot.set(null);
    }
  }

  selectMeal(dateKey: string, mealType: MealType): void {
    const meal = this.getMealForSlot(dateKey, mealType);
    if (!meal) {
      return;
    }

    this.selectedRecipeId.set(meal.recipeId);
    this.selectedSlot.set({ dateKey, mealType });
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

  aggregateIngredients(
    meals: Pick<PlannedMeal, 'recipeId' | 'plannedServings'>[],
  ): Omit<ShoppingListItem, 'checked'>[] {
    const merged = new Map<string, Ingredient>();

    for (const meal of meals) {
      const recipe = this.getRecipe(meal.recipeId);
      if (!recipe) {
        continue;
      }

      const scale = this.getServingScale(recipe, meal.plannedServings);

      for (const ingredient of recipe.ingredients) {
        const key = this.ingredientKey(ingredient.name, ingredient.unit);
        const scaledQuantity = this.roundQuantity(ingredient.quantity * scale);
        const existing = merged.get(key);

        if (existing) {
          existing.quantity = this.roundQuantity(
            existing.quantity + scaledQuantity,
          );
        } else {
          merged.set(key, {
            ...ingredient,
            quantity: scaledQuantity,
          });
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
    plannedServings?: number,
  ): void {
    const existingIds = this.collectRecipeIds();

    if (saveToCatalog) {
      const resolved = ensureUniqueApiRecipeId(recipe, existingIds);

      if (!this.recipes().some((item) => item.id === resolved.id)) {
        this.recipes.update((recipes) => [...recipes, resolved]);
      }

      this.assignMeal(dateKey, mealType, resolved.id, plannedServings);
      return;
    }

    const resolved = remapConflictingRecipe(recipe, existingIds);
    this.ephemeralRecipes.update((recipes) => {
      const next = new Map(recipes);
      next.set(resolved.id, resolved);
      return next;
    });

    this.assignMeal(dateKey, mealType, resolved.id, plannedServings);
  }

  assignMeal(
    dateKey: string,
    mealType: MealType,
    recipeId: string,
    plannedServings?: number,
  ): void {
    const recipe = this.getRecipe(recipeId);
    const servings = this.normalizeServings(
      plannedServings ?? recipe?.baseServings ?? 1,
    );

    const meal: PlannedMeal = {
      id: `planned-${dateKey}-${mealType}`,
      date: dateKey,
      mealType,
      recipeId,
      plannedServings: servings,
    };

    const existing = this.getMealForSlot(dateKey, mealType);

    if (existing) {
      this.plannedMeals.update((meals) =>
        meals.map((item) => (item.id === existing.id ? meal : item)),
      );
    } else {
      this.plannedMeals.update((meals) => [...meals, meal]);
    }

    this.selectMeal(dateKey, mealType);
  }

  updatePlannedServings(
    dateKey: string,
    mealType: MealType,
    servings: number,
  ): void {
    const existing = this.getMealForSlot(dateKey, mealType);
    if (!existing) {
      return;
    }

    const normalized = this.normalizeServings(servings);

    this.plannedMeals.update((meals) =>
      meals.map((meal) =>
        meal.id === existing.id
          ? { ...meal, plannedServings: normalized }
          : meal,
      ),
    );
  }

  getServingScale(recipe: Recipe, plannedServings: number): number {
    const baseServings = recipe.baseServings > 0 ? recipe.baseServings : 1;
    return this.normalizeServings(plannedServings) / baseServings;
  }

  scaledIngredients(recipe: Recipe, plannedServings: number): Ingredient[] {
    const scale = this.getServingScale(recipe, plannedServings);

    return recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: this.roundQuantity(ingredient.quantity * scale),
    }));
  }

  scaledCalories(recipe: Recipe, plannedServings: number): number {
    return Math.round(
      recipe.calories * this.getServingScale(recipe, plannedServings),
    );
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
    } else {
      const slot = this.selectedSlot();
      if (
        slot?.dateKey === dateKey &&
        slot.mealType === mealType
      ) {
        this.selectRecipe(null);
      }
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

  deleteRecipe(recipeId: string): DeleteRecipeResult {
    if (isStubRecipeId(recipeId)) {
      return {
        success: false,
        error: 'Les recettes de démonstration ne peuvent pas être supprimées.',
      };
    }

    const inPlan = this.plannedMeals().some((meal) => meal.recipeId === recipeId);
    if (inPlan) {
      return {
        success: false,
        error: 'Cette recette est utilisée dans le planning. Retirez-la des créneaux avant de la supprimer.',
      };
    }

    const inCatalog = this.recipes().some((recipe) => recipe.id === recipeId);
    const inEphemeral = this.ephemeralRecipes().has(recipeId);

    if (!inCatalog && !inEphemeral) {
      return {
        success: false,
        error: 'Recette introuvable.',
      };
    }

    if (inCatalog) {
      this.recipes.update((recipes) =>
        recipes.filter((recipe) => recipe.id !== recipeId),
      );
    }

    if (inEphemeral) {
      this.ephemeralRecipes.update((recipes) => {
        const next = new Map(recipes);
        next.delete(recipeId);
        return next;
      });
    }

    if (this.selectedRecipeId() === recipeId) {
      this.selectRecipe(null);
    }

    return { success: true };
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

  private hydrateFromStorage(): void {
    const stored = this.storage.load();
    if (!stored) {
      return;
    }

    const customRecipes = mergeCustomRecipes(stored.customRecipes);
    this.recipes.set([...STUB_RECIPES, ...customRecipes]);
    this.plannedMeals.set(this.migratePlannedMeals(stored.plannedMeals));
    this.shoppingCheckedIds.set(new Set(stored.shoppingCheckedIds));

    const ephemeral = new Map<string, Recipe>();
    const existingIds = this.collectRecipeIds();

    for (const recipe of stored.ephemeralRecipes) {
      const resolved = remapConflictingRecipe(recipe, existingIds);
      ephemeral.set(resolved.id, resolved);
    }

    this.ephemeralRecipes.set(ephemeral);
    this.reconcilePlannedMeals();
  }

  private persistState(): void {
    const stubIds = new Set(STUB_RECIPES.map((recipe) => recipe.id));
    const customRecipes = this.recipes().filter(
      (recipe) => !stubIds.has(recipe.id),
    );

    this.storage.save({
      customRecipes,
      ephemeralRecipes: Array.from(this.ephemeralRecipes().values()),
      plannedMeals: this.plannedMeals(),
      shoppingCheckedIds: Array.from(this.shoppingCheckedIds()),
    });
  }

  private reconcilePlannedMeals(): void {
    this.plannedMeals.update((meals) =>
      meals.filter((meal) => !!this.getRecipe(meal.recipeId)),
    );
  }

  private collectRecipeIds(): Set<string> {
    const ids = new Set(this.recipes().map((recipe) => recipe.id));

    for (const id of this.ephemeralRecipes().keys()) {
      ids.add(id);
    }

    return ids;
  }

  private migratePlannedMeals(
    meals: Array<PlannedMeal & { plannedServings?: number }>,
  ): PlannedMeal[] {
    return meals.map((meal) => {
      if (meal.plannedServings != null && meal.plannedServings >= 1) {
        return {
          ...meal,
          plannedServings: this.normalizeServings(meal.plannedServings),
        };
      }

      const recipe = this.getRecipe(meal.recipeId);
      return {
        ...meal,
        plannedServings: recipe?.baseServings ?? 1,
      };
    });
  }

  private normalizeServings(value: number): number {
    const rounded = Math.round(value);
    return rounded >= 1 ? rounded : 1;
  }

  private roundQuantity(quantity: number): number {
    return Math.round(quantity * 100) / 100;
  }

  private ingredientKey(name: string, unit: string): string {
    return `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;
  }

  private generateRecipeId(): string {
    return generateUniqueRecipeId(this.collectRecipeIds());
  }
}
