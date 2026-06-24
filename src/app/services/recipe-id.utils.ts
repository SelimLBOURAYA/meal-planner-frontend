import { STUB_RECIPES } from '../data/stub.data';
import { Recipe } from '../models/meal.models';

const STUB_IDS = new Set(STUB_RECIPES.map((recipe) => recipe.id));

export function isStubRecipeId(id: string): boolean {
  return STUB_IDS.has(id);
}

export function isUserRecipeId(id: string): boolean {
  return id.startsWith('recipe-user-');
}

export function isApiRecipeId(id: string): boolean {
  return id.startsWith('themealdb-');
}

export function generateUniqueRecipeId(existingIds: Set<string>): string {
  do {
    const id = `recipe-user-${crypto.randomUUID()}`;
    if (!existingIds.has(id)) {
      return id;
    }
  } while (true);
}

export function remapConflictingRecipe(
  recipe: Recipe,
  existingIds: Set<string>,
): Recipe {
  if (!existingIds.has(recipe.id)) {
    existingIds.add(recipe.id);
    return recipe;
  }

  const remapped: Recipe = {
    ...recipe,
    id: generateUniqueRecipeId(existingIds),
  };
  existingIds.add(remapped.id);
  return remapped;
}

export function mergeCustomRecipes(
  storedRecipes: Recipe[],
  stubIds: Set<string> = STUB_IDS,
): Recipe[] {
  const merged: Recipe[] = [];
  const seenIds = new Set<string>(stubIds);

  for (const recipe of storedRecipes) {
    if (stubIds.has(recipe.id)) {
      continue;
    }

    const resolved = remapConflictingRecipe(recipe, seenIds);
    merged.push(resolved);
  }

  return merged;
}

export function ensureUniqueApiRecipeId(
  recipe: Recipe,
  existingIds: Set<string>,
): Recipe {
  if (!existingIds.has(recipe.id)) {
    return recipe;
  }

  const existingStub = STUB_IDS.has(recipe.id);
  if (existingStub) {
    return remapConflictingRecipe(recipe, new Set(existingIds));
  }

  return recipe;
}
