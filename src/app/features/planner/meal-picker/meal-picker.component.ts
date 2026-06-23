import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  MEAL_TYPE_LABELS,
  MealType,
  Recipe,
} from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';

@Component({
  selector: 'app-meal-picker',
  templateUrl: './meal-picker.component.html',
  styleUrl: './meal-picker.component.scss',
})
export class MealPickerComponent implements AfterViewInit {
  private readonly planner = inject(MealPlannerService);

  readonly dateKey = input.required<string>();
  readonly mealType = input.required<MealType>();
  readonly dayLabel = input.required<string>();

  readonly close = output<void>();
  readonly assign = output<string>();

  readonly searchQuery = signal('');
  readonly selectedRecipeId = signal<string | null>(null);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly mealTypeLabels = MEAL_TYPE_LABELS;

  readonly filteredRecipes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const recipes = this.planner.recipes();

    if (!query) {
      return recipes;
    }

    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  });

  readonly selectedRecipe = computed(() => {
    const recipeId = this.selectedRecipeId();
    return recipeId ? this.planner.getRecipe(recipeId) : undefined;
  });

  ngAfterViewInit(): void {
    this.searchInput()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.selectedRecipeId.set(null);
  }

  selectRecipe(recipe: Recipe): void {
    this.selectedRecipeId.set(recipe.id);
  }

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  onAssign(): void {
    const recipeId = this.selectedRecipeId();
    if (recipeId) {
      this.assign.emit(recipeId);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
