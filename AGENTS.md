# AGENTS.md — Planificateur de repas

> Gouvernance des agents. Lire **en premier**, puis `dev-plan.md`.
> `dev-plan.md` = **quoi** (périmètre) ; ce fichier = **comment** (conventions).
> Un lot à la fois. Stop après ouverture de la PR. Attendre la review.

---

## Projet

SPA Angular connectée au backend Spring Boot `meal-planner-backend` (`../meal-planner-backend`) :

- 2 repas/jour : `lunch` + `dinner` — **jamais de petit-déjeuner**
- Recettes et planning persistés côté backend (PostgreSQL) — 2 utilisateurs partagent le même planning
- Import TheMealDB via proxy backend (traduction française, exclusion d'ingrédients)
- Auth JWT : `access_token` + `refresh_token` dans `localStorage`
- Persistance domaine : **backend uniquement** (lot 13+). `localStorage` réservé aux tokens.

App personnelle : pas de cloud tiers, télémétrie ni analytics.

---

## Stack (versions figées — ne pas inventer)

| Outil | Version | Note |
|-------|---------|------|
| Angular | 21 (standalone) | `ng new --standalone --routing --style=scss`. Pas de NgModules. |
| TypeScript | fourni avec Angular 21 | mode strict |
| État | **signals** Angular | `signal()` / `computed()` ; pas de NgRx ni BehaviorSubject |
| Formulaires | **Reactive Forms** | pas Signal Forms |
| HTTP | `HttpClient` (`provideHttpClient`) | câblé lot 01, intercepteur JWT lot 13 |
| Backend | Spring Boot 4.1 (`../meal-planner-backend`) | REST JSON, JWT, PostgreSQL |
| API externe | TheMealDB V1 via proxy backend | `GET /api/themealdb/…`, traduction FR lot 14 |
| Node | LTS (≥ 22) | |

Version inconnue → **s'arrêter et demander**, ne pas deviner.

---

## Workflow par lot

1. Un lot = une branche = une PR (`lot-XX-slug` dans `dev-plan.md`).
2. Lot N+1 part de la base **après** merge du lot N.
3. Avant chaque commit et avant la PR : `npm run build` vert.
4. Avant la PR : skill `lot-audit` — sécurité, performance, architecture (voir [Traçabilité des réponses](#traçabilité-des-réponses)).
5. Description PR : objectif, checklist, plan de test (modèle dans `dev-plan.md`). Capture si UI.
6. PR ouverte → **stop**. Ne pas enchaîner le lot suivant.

### Commits

- Conventional Commits en **anglais**, mode impératif.
- Scope = numéro de lot : `feat(02): add meal domain models and stub data`.
- Types : `feat`, `fix`, `refactor`, `chore`, `docs`, `style`.
- Tiret demi-cadratin ( – ) en prose, pas tiret cadratin ( — ). Pas de français dans commits, code ni noms de variables.
- Un changement logique par commit.

---

## Architecture

- Composants **standalone** uniquement (`imports: [...]`, pas de NgModule partagé).
- **Signals** pour l'état réactif : service avec `signal()` + `computed()` ; composants lisent les signaux dans les templates.
- **`MealPlannerService`** possède l'état (recipes, plannedMeals, weekOffset, selection). Composants fins.
- Smart/dumb : pages orchestrantes ; slots/panneaux/listes en inputs/outputs.
- Dossiers : `core/` (auth, api, models), `shared/` (UI), `features/` (planner, recipes, shopping, login).
- `core/auth/` : `AuthService`, `auth.guard.ts`, `auth.interceptor.ts`.
- `core/api/` : `RecipesApiService`, `PlannedMealsApiService`, `ShoppingApiService`.
- `environments/` : `environment.ts` (`apiBaseUrl: http://localhost:8080/api`) et `.prod.ts` (`apiBaseUrl: /api`).
- Modèles dans `src/app/models/`, typage strict, pas de `any`.
- Ingrédients : `{ name, quantity, unit }` — jamais de chaîne libre (`"200 g tomates"`).
- Quantités par portion : `Recipe.baseServings`, mise à l'échelle `plannedServings / baseServings` (détails dans `dev-plan.md`).
- Accessibilité dès le départ : labels, `aria-*`, modales au clavier.

---

## TheMealDB (lot 09–14)

- Lot 09–12 : appels directs `https://www.themealdb.com/api/json/v1/1/`.
- Lot 14+ : proxy backend `GET /api/themealdb/search?q=…&exclude=…` (traduction FR, exclusion d'ingrédients).
- Mapper dédié `mapTheMealDbToRecipe()` : `strIngredient1..20` + `strMeasure1..20` → `{ quantity, unit }` (nombre seul → `unit: 'pièce'`).
- Gérer chargement, erreur réseau, résultat vide. Échec d'import sans corruption de l'état.

---

## Auth JWT (lot 13+)

- `AuthService` : `login()`, `register()`, `logout()`, `refresh()`, signal `currentUser`.
- Tokens stockés : `meal-planner-access-token` + `meal-planner-refresh-token` dans `localStorage`.
- Intercepteur HTTP : injecte `Authorization: Bearer <token>` sur toutes les requêtes `apiBaseUrl`.
- `401` → tentative de refresh ; si échec → `logout()` + redirection `/login`.
- `authGuard` protège toutes les routes sauf `/login`.

---

## Interdictions

- Pas de `breakfast` dans `MealType` ni l'UI.
- Pas d'ingrédients en texte libre.
- Pas de commit avec build cassé.
- Pas de stockage distant hors backend `meal-planner-backend`. Pas de cloud tiers.
- Pas d'invention de versions ou d'endpoints — demander ou chercher.
- Pas de Signal Forms.
- Pas de décisions de périmètre ici — voir `dev-plan.md`.

---

## Traçabilité des réponses

**Chaque réponse de l'agent** se termine par un bloc **Traçabilité** (même pour une question courte ou un échec). Trois parties obligatoires :

### 1. Skills déclenchés

Lister les skills Cursor effectivement lus ou appliqués pendant la réponse. Exemples : `lot-audit`, `review-security`, `create-pull-requests`. Si aucun : `aucun`.

### 2. Sections AGENTS.md déclenchées

Lister les sections de ce fichier dont les règles ont guidé la réponse (titres `##` exacts). Exemples : `Workflow par lot`, `Architecture`, `Interdictions`. Si aucune : `aucune`.

### 3. Rapport d'audit

| Contexte | Contenu attendu |
|----------|-----------------|
| Fin de lot ou avant PR | Rapport complet du skill `lot-audit` (template dans `.cursor/skills/lot-audit/SKILL.md`) |
| Travail en cours sur un lot | Résumé : dernière exécution de `lot-audit` ou `non exécuté — prévu avant PR` |
| Hors périmètre lot (question, doc, config) | `hors périmètre audit` |

Ne pas omettre ce bloc pour alléger la réponse.

### 3.5. Avant la PR : skill `lot-audit` — sécurité, performance, architecture.


### Modèle

```markdown
---

## Traçabilité

**Skills :** lot-audit, style…
**Sections AGENTS.md :** Workflow par lot, Architecture, …
**Audit :** [rapport complet | résumé | hors périmètre audit]
```

---

## Prompt agent (par lot)

```
Lire AGENTS.md et dev-plan.md. Exécuter le lot XX tel que spécifié.
npm run build vert avant commit. lot-audit avant PR. Ouvrir la PR et stop. Attendre la review.
Terminer chaque réponse par le bloc Traçabilité (skills, sections AGENTS.md, rapport d'audit).
```

Ne pas recoller le ticket complet — l'agent le lit dans `dev-plan.md`.
