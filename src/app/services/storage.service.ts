import { Injectable } from '@angular/core';

import { PlannedMeal, Recipe } from '../models/meal.models';

const STORAGE_KEY = 'meal-planner-state';
const STORAGE_VERSION = 1;

export interface PersistedState {
  version: number;
  customRecipes: Recipe[];
  ephemeralRecipes: Recipe[];
  plannedMeals: PlannedMeal[];
  shoppingCheckedIds: string[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as PersistedState;

      if (parsed.version !== STORAGE_VERSION) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  save(state: Omit<PersistedState, 'version'>): void {
    try {
      const payload: PersistedState = {
        version: STORAGE_VERSION,
        ...state,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota exceeded or private browsing – fail silently.
    }
  }
}
