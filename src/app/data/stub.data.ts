import {
  MealType,
  PlannedMeal,
  Recipe,
  ShoppingListItem,
} from '../models/meal.models';

export const STUB_RECIPES: Recipe[] = [
  {
    id: 'recipe-01',
    name: 'Spaghetti carbonara',
    description:
      'Pâtes crémeuses aux lardons, jaunes d\'œufs et pecorino – un classique italien rapide.',
    emoji: '🍝',
    tags: ['rapide', 'comfort food'],
    prepTime: 10,
    cookTime: 15,
    baseServings: 2,
    calories: 620,
    ingredients: [
      { name: 'Spaghetti', quantity: 200, unit: 'g' },
      { name: 'Lardons fumés', quantity: 150, unit: 'g' },
      { name: 'Jaunes d\'œufs', quantity: 3, unit: 'pièce' },
      { name: 'Pecorino râpé', quantity: 50, unit: 'g' },
      { name: 'Poivre noir', quantity: 1, unit: 'c. à café' },
    ],
  },
  {
    id: 'recipe-02',
    name: 'Curry de lentilles',
    description:
      'Curry végétarien aux lentilles corail, lait de coco et épices douces.',
    emoji: '🍛',
    tags: ['végétarien', 'sans gluten'],
    prepTime: 15,
    cookTime: 25,
    baseServings: 4,
    calories: 380,
    ingredients: [
      { name: 'Lentilles corail', quantity: 300, unit: 'g' },
      { name: 'Lait de coco', quantity: 400, unit: 'ml' },
      { name: 'Oignon', quantity: 1, unit: 'pièce' },
      { name: 'Curry en poudre', quantity: 2, unit: 'c. à soupe' },
      { name: 'Tomates concassées', quantity: 400, unit: 'g' },
      { name: 'Épinards frais', quantity: 100, unit: 'g' },
    ],
  },
  {
    id: 'recipe-03',
    name: 'Saumon en papillote',
    description:
      'Pavés de saumon cuits au four avec citron, aneth et légumes croquants.',
    emoji: '🐟',
    tags: ['léger', 'oméga-3'],
    prepTime: 15,
    cookTime: 20,
    baseServings: 2,
    calories: 420,
    ingredients: [
      { name: 'Pavés de saumon', quantity: 2, unit: 'pièce' },
      { name: 'Courgette', quantity: 1, unit: 'pièce' },
      { name: 'Citron', quantity: 1, unit: 'pièce' },
      { name: 'Aneth frais', quantity: 10, unit: 'g' },
      { name: 'Huile d\'olive', quantity: 2, unit: 'c. à soupe' },
    ],
  },
  {
    id: 'recipe-04',
    name: 'Poulet rôti aux légumes',
    description:
      'Cuisses de poulet dorées au four accompagnées de pommes de terre et carottes.',
    emoji: '🍗',
    tags: ['familial', 'batch cooking'],
    prepTime: 20,
    cookTime: 45,
    baseServings: 4,
    calories: 510,
    ingredients: [
      { name: 'Cuisses de poulet', quantity: 4, unit: 'pièce' },
      { name: 'Pommes de terre', quantity: 600, unit: 'g' },
      { name: 'Carottes', quantity: 300, unit: 'g' },
      { name: 'Thym', quantity: 3, unit: 'brin' },
      { name: 'Huile d\'olive', quantity: 3, unit: 'c. à soupe' },
    ],
  },
  {
    id: 'recipe-05',
    name: 'Salade César maison',
    description:
      'Laitue romaine croquante, croûtons, parmesan et sauce César onctueuse.',
    emoji: '🥗',
    tags: ['rapide', 'salade'],
    prepTime: 15,
    cookTime: 5,
    baseServings: 2,
    calories: 340,
    ingredients: [
      { name: 'Laitue romaine', quantity: 1, unit: 'pièce' },
      { name: 'Croûtons', quantity: 80, unit: 'g' },
      { name: 'Parmesan', quantity: 40, unit: 'g' },
      { name: 'Anchois', quantity: 4, unit: 'pièce' },
      { name: 'Jaune d\'œuf', quantity: 1, unit: 'pièce' },
      { name: 'Huile d\'olive', quantity: 4, unit: 'c. à soupe' },
    ],
  },
  {
    id: 'recipe-06',
    name: 'Risotto aux champignons',
    description:
      'Risotto crémeux aux champignons de Paris et parmesan finement râpé.',
    emoji: '🍄',
    tags: ['végétarien', 'réconfortant'],
    prepTime: 10,
    cookTime: 30,
    baseServings: 3,
    calories: 450,
    ingredients: [
      { name: 'Riz arborio', quantity: 300, unit: 'g' },
      { name: 'Champignons de Paris', quantity: 250, unit: 'g' },
      { name: 'Bouillon de légumes', quantity: 800, unit: 'ml' },
      { name: 'Parmesan', quantity: 60, unit: 'g' },
      { name: 'Beurre', quantity: 30, unit: 'g' },
      { name: 'Échalote', quantity: 1, unit: 'pièce' },
    ],
  },
  {
    id: 'recipe-07',
    name: 'Tacos de bœuf',
    description:
      'Tortillas garnies de bœuf haché épicé, salsa fraîche et avocat.',
    emoji: '🌮',
    tags: ['mexicain', 'convivial'],
    prepTime: 20,
    cookTime: 15,
    baseServings: 4,
    calories: 480,
    ingredients: [
      { name: 'Tortillas de blé', quantity: 8, unit: 'pièce' },
      { name: 'Bœuf haché', quantity: 500, unit: 'g' },
      { name: 'Avocat', quantity: 2, unit: 'pièce' },
      { name: 'Tomates', quantity: 3, unit: 'pièce' },
      { name: 'Oignon rouge', quantity: 1, unit: 'pièce' },
      { name: 'Cumin', quantity: 1, unit: 'c. à café' },
    ],
  },
  {
    id: 'recipe-08',
    name: 'Soupe pho végétarienne',
    description:
      'Bouillon parfumé au gingembre et à la cannelle, nouilles de riz et légumes.',
    emoji: '🍜',
    tags: ['végétarien', 'réconfortant'],
    prepTime: 20,
    cookTime: 30,
    baseServings: 4,
    calories: 290,
    ingredients: [
      { name: 'Nouilles de riz', quantity: 200, unit: 'g' },
      { name: 'Bouillon de légumes', quantity: 1.5, unit: 'L' },
      { name: 'Gingembre frais', quantity: 30, unit: 'g' },
      { name: 'Champignons shiitaké', quantity: 150, unit: 'g' },
      { name: 'Pak choï', quantity: 200, unit: 'g' },
      { name: 'Sauce soja', quantity: 3, unit: 'c. à soupe' },
    ],
  },
  {
    id: 'recipe-09',
    name: 'Gratin dauphinois',
    description:
      'Pommes de terre fondantes en tranches, crème et ail – gratin doré au four.',
    emoji: '🥔',
    tags: ['réconfortant', 'hiver'],
    prepTime: 20,
    cookTime: 60,
    baseServings: 6,
    calories: 390,
    ingredients: [
      { name: 'Pommes de terre', quantity: 1, unit: 'kg' },
      { name: 'Crème liquide', quantity: 400, unit: 'ml' },
      { name: 'Lait', quantity: 200, unit: 'ml' },
      { name: 'Ail', quantity: 2, unit: 'gousse' },
      { name: 'Muscade', quantity: 0.5, unit: 'c. à café' },
    ],
  },
  {
    id: 'recipe-10',
    name: 'Buddha bowl quinoa',
    description:
      'Bol équilibré de quinoa, pois chiches rôtis, avocat et légumes de saison.',
    emoji: '🥙',
    tags: ['healthy', 'végétarien'],
    prepTime: 20,
    cookTime: 25,
    baseServings: 2,
    calories: 410,
    ingredients: [
      { name: 'Quinoa', quantity: 150, unit: 'g' },
      { name: 'Pois chiches', quantity: 200, unit: 'g' },
      { name: 'Avocat', quantity: 1, unit: 'pièce' },
      { name: 'Betterave cuite', quantity: 150, unit: 'g' },
      { name: 'Graines de sésame', quantity: 2, unit: 'c. à soupe' },
      { name: 'Tahini', quantity: 2, unit: 'c. à soupe' },
    ],
  },
];

export const STUB_SHOPPING_LIST: ShoppingListItem[] = [
  { id: 'shop-01', name: 'Spaghetti', quantity: 400, unit: 'g', checked: true },
  { id: 'shop-02', name: 'Lardons fumés', quantity: 150, unit: 'g', checked: true },
  { id: 'shop-03', name: 'Lentilles corail', quantity: 300, unit: 'g', checked: false },
  { id: 'shop-04', name: 'Lait de coco', quantity: 400, unit: 'ml', checked: false },
  { id: 'shop-05', name: 'Pavés de saumon', quantity: 2, unit: 'pièce', checked: false },
  { id: 'shop-06', name: 'Courgette', quantity: 2, unit: 'pièce', checked: true },
  { id: 'shop-07', name: 'Pommes de terre', quantity: 1.6, unit: 'kg', checked: false },
  { id: 'shop-08', name: 'Riz arborio', quantity: 300, unit: 'g', checked: false },
  { id: 'shop-09', name: 'Champignons de Paris', quantity: 400, unit: 'g', checked: false },
  { id: 'shop-10', name: 'Tortillas de blé', quantity: 8, unit: 'pièce', checked: false },
  { id: 'shop-11', name: 'Bœuf haché', quantity: 500, unit: 'g', checked: false },
  { id: 'shop-12', name: 'Avocat', quantity: 3, unit: 'pièce', checked: true },
  { id: 'shop-13', name: 'Quinoa', quantity: 150, unit: 'g', checked: false },
  { id: 'shop-14', name: 'Huile d\'olive', quantity: 1, unit: 'bouteille', checked: true },
];

const MEAL_TYPES: MealType[] = ['lunch', 'dinner'];

const FRENCH_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

export function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate();
  const startMonth = FRENCH_MONTHS[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = FRENCH_MONTHS[end.getMonth()];

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayOfWeek(referenceDate: Date, weekOffset = 0): Date {
  const date = new Date(referenceDate);
  date.setHours(0, 0, 0, 0);

  const dayOfWeek = date.getDay();
  const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + daysFromMonday + weekOffset * 7);

  return date;
}

export function generateStubPlan(referenceDate: Date): PlannedMeal[] {
  const monday = getMondayOfWeek(referenceDate);
  const plannedMeals: PlannedMeal[] = [];
  let mealIndex = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayOffset);
    const dateKey = toDateKey(date);

    for (const mealType of MEAL_TYPES) {
      const recipe = STUB_RECIPES[mealIndex % STUB_RECIPES.length];
      plannedMeals.push({
        id: `planned-${dateKey}-${mealType}`,
        date: dateKey,
        mealType,
        recipeId: recipe.id,
      });
      mealIndex++;
    }
  }

  return plannedMeals;
}
