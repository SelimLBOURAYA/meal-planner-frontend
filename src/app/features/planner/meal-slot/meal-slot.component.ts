import { Component, input, output, signal } from '@angular/core';

import { Recipe } from '../../../models/meal.models';

@Component({
  selector: 'app-meal-slot',
  templateUrl: './meal-slot.component.html',
  styleUrl: './meal-slot.component.scss',
})
export class MealSlotComponent {
  readonly recipe = input<Recipe | undefined>();
  readonly plannedServings = input(1);
  readonly selected = input(false);
  readonly recipeSelect = output<void>();
  readonly servingsChange = output<number>();
  readonly emptySlotClick = output<void>();
  readonly replaceClick = output<void>();
  readonly removeClick = output<void>();

  readonly menuOpen = signal(false);

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  scaledCalories(recipe: Recipe): number {
    const baseServings = recipe.baseServings > 0 ? recipe.baseServings : 1;
    const scale = this.plannedServings() / baseServings;
    return Math.round(recipe.calories * scale);
  }

  onFilledSlotClick(): void {
    this.menuOpen.set(false);
    this.recipeSelect.emit();
  }

  onEmptySlotClick(): void {
    this.emptySlotClick.emit();
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  onReplace(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.replaceClick.emit();
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.removeClick.emit();
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  decrementServings(event: MouseEvent): void {
    event.stopPropagation();
    const next = this.plannedServings() - 1;
    if (next >= 1) {
      this.servingsChange.emit(next);
    }
  }

  incrementServings(event: MouseEvent): void {
    event.stopPropagation();
    this.servingsChange.emit(this.plannedServings() + 1);
  }
}
