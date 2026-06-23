import { Component, input, output, signal } from '@angular/core';

import { Recipe } from '../../../models/meal.models';

@Component({
  selector: 'app-meal-slot',
  templateUrl: './meal-slot.component.html',
  styleUrl: './meal-slot.component.scss',
})
export class MealSlotComponent {
  readonly recipe = input<Recipe | undefined>();
  readonly selected = input(false);
  readonly recipeSelect = output<string>();
  readonly emptySlotClick = output<void>();
  readonly replaceClick = output<void>();
  readonly removeClick = output<void>();

  readonly menuOpen = signal(false);

  totalDuration(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  onFilledSlotClick(recipe: Recipe): void {
    this.menuOpen.set(false);
    this.recipeSelect.emit(recipe.id);
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
}
