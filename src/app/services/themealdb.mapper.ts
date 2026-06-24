import { Ingredient, Recipe } from '../models/meal.models';
import { TheMealDbMeal } from '../models/themealdb.models';

const INGREDIENT_FIELD_COUNT = 20;

const DEFAULT_PREP_TIME = 20;
const DEFAULT_COOK_TIME = 30;
const DEFAULT_CALORIES = 400;
const DEFAULT_SERVINGS = 4;
const DEFAULT_EMOJI = '🍽️';

const CATEGORY_EMOJI: Record<string, string> = {
  Beef: '🥩',
  Breakfast: '🍳',
  Chicken: '🍗',
  Dessert: '🍰',
  Goat: '🍖',
  Lamb: '🍖',
  Miscellaneous: '🍽️',
  Pasta: '🍝',
  Pork: '🥓',
  Seafood: '🐟',
  Side: '🥗',
  Starter: '🥙',
  Vegan: '🥬',
  Vegetarian: '🥗',
};

export function mapTheMealDbToRecipe(meal: TheMealDbMeal): Recipe {
  const tags = [meal.strCategory, meal.strArea].filter(
    (tag): tag is string => !!tag?.trim(),
  );

  return {
    id: `themealdb-${meal.idMeal}`,
    name: meal.strMeal,
    description: meal.strInstructions?.trim() ?? '',
    emoji: categoryToEmoji(meal.strCategory),
    tags,
    prepTime: DEFAULT_PREP_TIME,
    cookTime: DEFAULT_COOK_TIME,
    baseServings: DEFAULT_SERVINGS,
    calories: DEFAULT_CALORIES,
    ingredients: extractIngredients(meal),
  };
}

export function parseMeasure(measure: string): Pick<Ingredient, 'quantity' | 'unit'> {
  const trimmed = measure.trim();

  if (!trimmed) {
    return { quantity: 1, unit: 'pièce' };
  }

  const match = trimmed.match(/^(\d+(?:\/\d+)?(?:[.,]\d+)?)\s*(.*)$/);

  if (match) {
    const quantity = parseQuantity(match[1]);
    const unit = match[2].trim() || 'pièce';
    return { quantity, unit };
  }

  return { quantity: 1, unit: trimmed };
}

function extractIngredients(meal: TheMealDbMeal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let index = 1; index <= INGREDIENT_FIELD_COUNT; index++) {
    const name = meal[`strIngredient${index}`]?.trim();
    if (!name) {
      continue;
    }

    const measure = meal[`strMeasure${index}`] ?? '';
    const { quantity, unit } = parseMeasure(measure);

    ingredients.push({ name, quantity, unit });
  }

  return ingredients;
}

function categoryToEmoji(category: string | null): string {
  if (!category) {
    return DEFAULT_EMOJI;
  }

  return CATEGORY_EMOJI[category] ?? DEFAULT_EMOJI;
}

function parseQuantity(raw: string): number {
  if (raw.includes('/')) {
    const [numerator, denominator] = raw.split('/').map(Number);
    if (denominator && !Number.isNaN(numerator) && !Number.isNaN(denominator)) {
      return numerator / denominator;
    }
  }

  const parsed = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 1;
}
