import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  MEAL_TYPE_LABELS,
  MealType,
  Recipe,
} from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';
import { TheMealDbService } from '../../../services/themealdb.service';

type PickerTab = 'local' | 'online';

@Component({
  selector: 'app-meal-picker',
  templateUrl: './meal-picker.component.html',
  styleUrl: './meal-picker.component.scss',
})
export class MealPickerComponent implements AfterViewInit {
  private readonly planner = inject(MealPlannerService);
  private readonly mealDb = inject(TheMealDbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dateKey = input.required<string>();
  readonly mealType = input.required<MealType>();
  readonly dayLabel = input.required<string>();

  readonly close = output<void>();
  readonly assign = output<string>();
  readonly assignApi = output<{ recipe: Recipe; saveToCatalog: boolean }>();

  readonly activeTab = signal<PickerTab>('local');
  readonly searchQuery = signal('');
  readonly selectedRecipeId = signal<string | null>(null);

  readonly apiQuery = signal('');
  readonly apiResults = signal<Recipe[]>([]);
  readonly apiLoading = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly selectedApiRecipe = signal<Recipe | null>(null);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly onlineSearchInput =
    viewChild<ElementRef<HTMLInputElement>>('onlineSearchInput');

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

  switchTab(tab: PickerTab): void {
    this.activeTab.set(tab);

    if (tab === 'online') {
      queueMicrotask(() => this.onlineSearchInput()?.nativeElement.focus());
      return;
    }

    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.selectedRecipeId.set(null);
  }

  onApiQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.apiQuery.set(value);
    this.apiError.set(null);
  }

  onApiSearchSubmit(event: Event): void {
    event.preventDefault();
    this.searchOnline();
  }

  searchOnline(): void {
    const query = this.apiQuery().trim();
    this.apiError.set(null);
    this.apiResults.set([]);
    this.selectedApiRecipe.set(null);

    if (!query) {
      this.apiError.set('Saisissez un nom de recette pour lancer la recherche.');
      return;
    }

    this.apiLoading.set(true);

    this.mealDb
      .searchMeals(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recipes) => {
          this.apiLoading.set(false);
          this.apiResults.set(recipes);

          if (recipes.length === 0) {
            this.apiError.set('Aucun résultat pour cette recherche.');
          }
        },
        error: (error: Error) => {
          this.apiLoading.set(false);
          this.apiError.set(this.mapApiErrorMessage(error));
        },
      });
  }

  selectRecipe(recipe: Recipe): void {
    this.selectedRecipeId.set(recipe.id);
  }

  selectApiRecipe(recipe: Recipe): void {
    this.selectedApiRecipe.set(recipe);
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

  onAssignApi(saveToCatalog: boolean): void {
    const recipe = this.selectedApiRecipe();
    if (recipe) {
      this.assignApi.emit({ recipe, saveToCatalog });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  private mapApiErrorMessage(error: Error): string {
    switch (error.message) {
      case 'NETWORK':
        return 'Impossible de joindre TheMealDB. Vérifiez votre connexion et réessayez.';
      case 'EMPTY_QUERY':
        return 'Saisissez un nom de recette pour lancer la recherche.';
      default:
        return 'Une erreur est survenue lors de la recherche. Réessayez plus tard.';
    }
  }
}
