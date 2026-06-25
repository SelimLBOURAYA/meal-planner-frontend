import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MealType, PlannedMeal } from '../../models/meal.models';

export interface AssignMealRequest {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  plannedServings: number;
}

@Injectable({ providedIn: 'root' })
export class PlannedMealsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/planned-meals`;

  getByRange(from: string, to: string): Observable<PlannedMeal[]> {
    return this.http.get<PlannedMeal[]>(this.base, { params: { from, to } });
  }

  assign(meal: AssignMealRequest): Observable<PlannedMeal> {
    return this.http.put<PlannedMeal>(this.base, meal);
  }

  updateServings(id: string, plannedServings: number): Observable<PlannedMeal> {
    return this.http.patch<PlannedMeal>(`${this.base}/${id}`, { plannedServings });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
