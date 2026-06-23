# CLAUDE.md — Planificateur de repas

> Agent governance document. Read this **first**, then `lots.md`.
> `lots.md` is the authoritative source of scope. This file defines **how** to build, not **what**.
> Execute one ticket (= one lot) at a time. Stop after the PR is opened. Wait for review.

---

## Project

Weekly meal planner (Angular SPA, client-only, no backend).
- Two meals/day: `lunch` + `dinner`. **No breakfast. Ever.**
- Create local recipes with per-ingredient quantities.
- Import recipes from TheMealDB (free public API, no key beyond the test key `1`).
- Plan meals on the current week, generate an aggregated shopping list.
- Persistence: in-memory until lot 10, then `localStorage`.

Personal/local app. No third-party cloud, no telemetry, no analytics.

---

## Stack (pinned — do NOT invent versions)

| Tool | Version | Note |
|------|---------|------|
| Angular | 21 (standalone) | `ng new --standalone --routing --style=scss`. No NgModules. |
| TypeScript | bundled with Angular 21 | strict mode on |
| State | Angular **signals** | services expose `signal()` / `computed()`, no NgRx, no BehaviorSubject |
| Forms | **Reactive Forms** | NOT Signal Forms — thinner training data, agent reliability risk |
| HTTP | `HttpClient` (`provideHttpClient`) | wired in lot 01, used in lot 09 |
| External API | TheMealDB V1, base `https://www.themealdb.com/api/json/v1/1/` | test key `1`, no auth |
| Node | LTS (≥ 22) | |

If a version detail is unknown, **stop and ask** — do not guess.

---

## Workflow per lot (non-negotiable)

1. One lot = one branch = one PR. Branch name from `lots.md` (`lot-XX-slug`).
2. Lot N+1 starts from the base branch **after** lot N is merged.
3. Validation gate before every commit and before opening the PR:
   ```
   npm run build
   ```
   Green build. A broken build blocks the commit — fix it or pull the feature.
4. PR description: lot objective, task checklist, manual test plan. Screenshot if UI.
5. After the PR is opened, **stop**. Do not start the next lot.

---

## Commit conventions

- Conventional Commits, **English**, imperative mood.
- Scope = lot number: `feat(02): add meal domain models and stub data`.
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`.
- En dash **U+2013** ( – ) in prose, never em dash U+2014 ( — ). No French drift in commits/code/variable names.
- One logical change per commit.

---

## Architecture conventions

- **Standalone components only.** `imports: [...]` on each component, no shared NgModule.
- **Signals for all reactive state.** Service holds `signal()` sources + `computed()` derivations. Components read signals in templates; no manual subscriptions for app state.
- **One service owns the planner state**: `MealPlannerService` (recipes, plannedMeals, weekOffset, selection). Components stay thin.
- **Smart/dumb split**: page components orchestrate; slot/panel/list components take inputs and emit outputs.
- Folder structure: `core/` (services, models, http), `shared/` (reusable UI), `features/` (planner, recipes, shopping).
- Models live in `core/models/`. Strongly typed, no `any`.
- **Ingredients are structured**: `{ name, quantity, unit }` objects. Never a free-text string like `"200 g tomates"`. The TheMealDB mapper (lot 09) must parse `strMeasure` into `{ quantity, unit }`.
- **Per-serving quantities**: recipe quantities are expressed for `Recipe.baseServings`; scale by `plannedServings / baseServings` when aggregating. (Confirm exact shape in `lots.md` — scope authority.)
- Accessibility from the start: form labels, `aria-*` on interactive controls, keyboard-navigable modals.

---

## TheMealDB integration (lot 09)

- Base URL: `https://www.themealdb.com/api/json/v1/1/`
- Endpoints used: `search.php?s=`, `lookup.php?i=`, `random.php`.
- Test key `1` is fine for personal use. Do **not** hardcode a fake supporter key.
- Always handle: loading state, network error, empty result.
- Map API → domain in a dedicated `mapTheMealDbToRecipe()`. Iterate `strIngredient1..20` + `strMeasure1..20`, drop empty slots, parse measures (number-only → `unit: 'pièce'`, number+unit → regex split).
- Never block the UI on the API; an import failure must not corrupt local state.

---

## Hard "do NOT" list

- Do NOT add `breakfast` anywhere in `MealType` or UI.
- Do NOT store ingredients as free-text strings.
- Do NOT commit with a broken build.
- Do NOT introduce a backend, auth, or remote storage (this is a local SPA).
- Do NOT invent Angular/library versions or TheMealDB endpoints — ask or search.
- Do NOT use Signal Forms; use Reactive Forms.
- Do NOT put scope decisions here — `lots.md` owns scope.

---

## deepclaude prompt (paste per lot)

```
Read CLAUDE.md and lots.md. Then execute lot XX exactly as specified.
Run `npm run build` green before committing.
Open the PR and stop. Wait for review.
```

Do not re-paste the full ticket text — the agent reads it from `lots.md`.
