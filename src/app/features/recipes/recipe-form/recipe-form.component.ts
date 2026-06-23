import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Ingredient } from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';

const INGREDIENT_UNITS = [
  'g',
  'kg',
  'ml',
  'L',
  'pièce',
  'c. à soupe',
  'c. à café',
] as const;

@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
})
export class RecipeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly planner = inject(MealPlannerService);
  private readonly router = inject(Router);

  readonly ingredientUnits = INGREDIENT_UNITS;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
    emoji: ['🍽️', [Validators.required, Validators.maxLength(4)]],
    prepTime: [15, [Validators.required, Validators.min(0)]],
    cookTime: [20, [Validators.required, Validators.min(0)]],
    baseServings: [2, [Validators.required, Validators.min(1)]],
    calories: [400, [Validators.required, Validators.min(0)]],
    ingredients: this.fb.nonNullable.array([this.createIngredientGroup()]),
  });

  get ingredients(): FormArray {
    return this.form.controls.ingredients;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientGroup());
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const ingredients: Ingredient[] = value.ingredients
      .filter((item) => item.name.trim() && item.quantity > 0)
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        unit: item.unit.trim() || 'pièce',
      }));

    if (ingredients.length === 0) {
      this.ingredients.setErrors({ required: true });
      this.ingredients.markAllAsTouched();
      return;
    }

    const recipe = this.planner.addRecipe({
      name: value.name.trim(),
      description: value.description.trim(),
      emoji: value.emoji.trim() || '🍽️',
      tags: [],
      prepTime: value.prepTime,
      cookTime: value.cookTime,
      baseServings: value.baseServings,
      calories: value.calories,
      ingredients,
    });

    void this.router.navigate(['/'], {
      queryParams: { created: recipe.id },
    });
  }

  ingredientError(index: number, field: 'name' | 'quantity' | 'unit'): boolean {
    const control = this.ingredients.at(index).get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private createIngredientGroup() {
    return this.fb.nonNullable.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit: ['g', Validators.required],
    });
  }
}
