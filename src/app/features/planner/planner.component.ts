import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { toDateKey } from '../../data/stub.data';
import {
  MEAL_TYPE_ICONS,
  MEAL_TYPE_LABELS,
  MealType,
} from '../../models/meal.models';
import { MealPlannerService } from '../../services/meal-planner.service';
import { MealSlotComponent } from './meal-slot/meal-slot.component';
import { MealPickerComponent } from './meal-picker/meal-picker.component';
import { RecipePanelComponent } from './recipe-panel/recipe-panel.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';

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

interface PickerContext {
  dateKey: string;
  mealType: MealType;
  dayLabel: string;
}

@Component({
  selector: 'app-planner',
  imports: [
    MealSlotComponent,
    MealPickerComponent,
    RecipePanelComponent,
    ShoppingListComponent,
    RouterLink,
  ],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent implements OnInit {
  private readonly planner = inject(MealPlannerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly createdRecipeName = signal<string | null>(null);
  readonly pickerContext = signal<PickerContext | null>(null);

  readonly mealTypeLabels = MEAL_TYPE_LABELS;
  readonly mealTypeIcons = MEAL_TYPE_ICONS;
  readonly mealTypes = MEAL_TYPES;
  readonly weekLabel = this.planner.weekLabel;
  readonly weekStats = this.planner.weekStats;
  readonly isCurrentWeek = computed(() => this.planner.weekOffset() === 0);

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

  openPicker(dateKey: string, mealType: MealType): void {
    const day = this.weekDays().find((item) => item.dateKey === dateKey);
    const dayLabel = day
      ? `${day.dayName} ${day.dayNumber}`
      : dateKey;

    this.pickerContext.set({ dateKey, mealType, dayLabel });
  }

  closePicker(): void {
    this.pickerContext.set(null);
  }

  onAssignMeal(recipeId: string): void {
    const context = this.pickerContext();
    if (!context) {
      return;
    }

    this.planner.assignMeal(context.dateKey, context.mealType, recipeId);
    this.closePicker();
  }

  onReplaceMeal(dateKey: string, mealType: MealType): void {
    this.openPicker(dateKey, mealType);
  }

  onRemoveMeal(dateKey: string, mealType: MealType): void {
    this.planner.removeMeal(dateKey, mealType);
  }

  previousWeek(): void {
    this.planner.previousWeek();
  }

  nextWeek(): void {
    this.planner.nextWeek();
  }

  goToCurrentWeek(): void {
    this.planner.goToCurrentWeek();
  }

  ngOnInit(): void {
    const createdId = this.route.snapshot.queryParamMap.get('created');

    if (createdId) {
      const recipe = this.planner.getRecipe(createdId);
      this.createdRecipeName.set(recipe?.name ?? 'Votre recette');
      void this.router.navigate([], {
        queryParams: { created: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  dismissCreatedMessage(): void {
    this.createdRecipeName.set(null);
  }
}
