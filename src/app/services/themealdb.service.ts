import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { Recipe } from '../models/meal.models';
import {
  TheMealDbLookupResponse,
  TheMealDbMeal,
  TheMealDbSearchResponse,
} from '../models/themealdb.models';
import { mapTheMealDbToRecipe } from './themealdb.mapper';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';

@Injectable({ providedIn: 'root' })
export class TheMealDbService {
  private readonly http = inject(HttpClient);

  searchMeals(query: string): Observable<Recipe[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return throwError(() => new Error('EMPTY_QUERY'));
    }

    return this.http
      .get<TheMealDbSearchResponse>(`${API_BASE}search.php`, {
        params: { s: trimmed },
      })
      .pipe(
        map((response) => this.mapMeals(response.meals)),
        catchError((error: HttpErrorResponse) =>
          throwError(() => this.toServiceError(error)),
        ),
      );
  }

  getMealById(id: string): Observable<Recipe> {
    return this.http
      .get<TheMealDbLookupResponse>(`${API_BASE}lookup.php`, {
        params: { i: id },
      })
      .pipe(
        map((response) => {
          const meal = response.meals?.[0];
          if (!meal) {
            throw new Error('NOT_FOUND');
          }
          return mapTheMealDbToRecipe(meal);
        }),
        catchError((error: HttpErrorResponse | Error) => {
          if (error instanceof Error && error.message === 'NOT_FOUND') {
            return throwError(() => error);
          }
          return throwError(() =>
            this.toServiceError(error as HttpErrorResponse),
          );
        }),
      );
  }

  getRandomMeal(): Observable<Recipe> {
    return this.http.get<TheMealDbLookupResponse>(`${API_BASE}random.php`).pipe(
      map((response) => {
        const meal = response.meals?.[0];
        if (!meal) {
          throw new Error('NOT_FOUND');
        }
        return mapTheMealDbToRecipe(meal);
      }),
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'NOT_FOUND') {
          return throwError(() => error);
        }
        return throwError(() =>
          this.toServiceError(error as HttpErrorResponse),
        );
      }),
    );
  }

  private mapMeals(meals: TheMealDbMeal[] | null): Recipe[] {
    if (!meals?.length) {
      return [];
    }

    return meals.map(mapTheMealDbToRecipe);
  }

  private toServiceError(error: HttpErrorResponse): Error {
    if (error.status === 0) {
      return new Error('NETWORK');
    }
    return new Error('API_ERROR');
  }
}
