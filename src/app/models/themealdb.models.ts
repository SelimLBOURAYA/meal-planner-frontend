export interface TheMealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  [key: `strIngredient${number}`]: string | null | undefined;
  [key: `strMeasure${number}`]: string | null | undefined;
}

export interface TheMealDbSearchResponse {
  meals: TheMealDbMeal[] | null;
}

export interface TheMealDbLookupResponse {
  meals: TheMealDbMeal[] | null;
}
