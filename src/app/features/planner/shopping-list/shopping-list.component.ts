import { Component, inject } from '@angular/core';

import { ShoppingListItem } from '../../../models/meal.models';
import { MealPlannerService } from '../../../services/meal-planner.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent {
  private readonly planner = inject(MealPlannerService);

  readonly items = this.planner.shoppingList;
  readonly progress = this.planner.shoppingListProgress;

  formatQuantity(item: ShoppingListItem): string {
    const quantity =
      Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(1);
    return `${quantity} ${item.unit}`;
  }

  toggleItem(itemId: string): void {
    this.planner.toggleShoppingItem(itemId);
  }
}
