import { Component, computed, inject } from '@angular/core';

import { toDateKey } from '../../data/stub.data';
import {
  MEAL_TYPE_ICONS,
  MEAL_TYPE_LABELS,
  MealType,
} from '../../models/meal.models';
import { MealPlannerService } from '../../services/meal-planner.service';
import { MealSlotComponent } from './meal-slot/meal-slot.component';
import { RecipePanelComponent } from './recipe-panel/recipe-panel.component';

const DAY_NAMES = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

const MEAL_TYPES: MealType[] = ['lunch', 'dinner'];

interface WeekDay {
  date: Date;
  dateKey: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

@Component({
  selector: 'app-planner',
  imports: [MealSlotComponent, RecipePanelComponent],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent {
  private readonly planner = inject(MealPlannerService);

  readonly mealTypeLabels = MEAL_TYPE_LABELS;
  readonly mealTypeIcons = MEAL_TYPE_ICONS;
  readonly mealTypes = MEAL_TYPES;

  readonly weekDays = computed<WeekDay[]>(() => {
    const monday = this.planner.getMondayOfCurrentWeek();
    const todayKey = toDateKey(new Date());

    return DAY_NAMES.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = toDateKey(date);

      return {
        date,
        dateKey,
        dayName,
        dayNumber: date.getDate(),
        isToday: dateKey === todayKey,
      };
    });
  });

  getRecipeForSlot(dateKey: string, mealType: MealType) {
    const meal = this.planner.getMealForSlot(dateKey, mealType);
    return meal ? this.planner.getRecipe(meal.recipeId) : undefined;
  }

  isSlotSelected(dateKey: string, mealType: MealType): boolean {
    const meal = this.planner.getMealForSlot(dateKey, mealType);
    return !!meal && this.planner.selectedRecipeId() === meal.recipeId;
  }

  onRecipeSelect(recipeId: string): void {
    this.planner.selectRecipe(recipeId);
  }
}
