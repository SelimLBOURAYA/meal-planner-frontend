export type MealType = 'lunch' | 'dinner';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  baseServings: number;
  calories: number;
  ingredients: Ingredient[];
}

export interface PlannedMeal {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  plannedServings: number;
}

export interface SelectedSlot {
  dateKey: string;
  mealType: MealType;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  lunch: 'Déjeuner',
  dinner: 'Dîner',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  lunch: '🍽️',
  dinner: '🌙',
};

export interface WeekStats {
  plannedCount: number;
  maxSlots: number;
  uniqueRecipes: number;
  avgCaloriesPerMeal: number;
  totalCalories: number;
}
