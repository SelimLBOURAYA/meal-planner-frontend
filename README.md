# Planificateur de repas

Application Angular de planification de repas hebdomadaire, entièrement locale (aucun backend). Les données sont persistées dans le **localStorage** du navigateur.

## Fonctionnalités

### Planning hebdomadaire

- Grille **7 jours × 2 repas** : déjeuner et dîner uniquement
- Affichage des repas planifiés avec emoji, nom, durée totale et calories
- Mise en évidence du **jour courant**
- Créneaux vides cliquables pour assigner une recette
- Actions par créneau : remplacer ou vider un repas (avec confirmation)

### Navigation temporelle

- Passage à la **semaine précédente** ou **suivante**
- Retour à la **semaine en cours** en cliquant sur la plage de dates
- Libellé de semaine au format français (ex. « 23 juin – 29 juin »)

### Statistiques de la semaine

- Nombre de **repas planifiés**
- Nombre de **recettes différentes**
- **Calories moyennes** par repas
- **Total calorique** de la semaine

### Détail des recettes

- Panneau latéral (desktop) ou **overlay mobile** au clic sur un repas
- Nom, description, tags, temps, portions, calories et ingrédients quantifiés
- Suppression des recettes personnalisées ou importées (avec confirmation)
- Fermeture au clic extérieur, bouton × ou touche Échap

### Création de recettes

- Formulaire réactif avec ingrédients dynamiques (`{ name, quantity, unit }`)
- Recettes enregistrées dans le catalogue local et persistées

### Import TheMealDB

- Recherche de recettes via l'API publique [TheMealDB](https://www.themealdb.com/)
- Assignation au créneau seul ou **enregistrement dans le catalogue** + assignation
- Gestion des erreurs réseau et résultats vides

### Liste de courses

- Agrégation dynamique des ingrédients de la semaine affichée
- **Cases à cocher** persistées pour marquer les articles achetés
- **Barre de progression** (articles cochés / total)

### Persistance locale

- Recettes utilisateur et importées
- Planning (`PlannedMeal[]`)
- État des cases cochées de la liste de courses
- Hydratation au démarrage, sauvegarde automatique à chaque modification

## Stack technique

- [Angular 19](https://angular.dev/) (composants standalone)
- [Signals](https://angular.dev/guide/signals) pour l'état réactif
- Reactive Forms pour la création de recettes
- `HttpClient` pour TheMealDB
- SCSS pour le style
- TypeScript 5.7

## Structure du projet

```
src/app/
├── models/                    # Types domaine (Recipe, PlannedMeal…)
├── data/stub.data.ts          # Recettes de démonstration
├── services/
│   ├── meal-planner.service.ts
│   ├── storage.service.ts
│   ├── themealdb.service.ts
│   └── themealdb.mapper.ts
├── features/
│   ├── planner/               # Grille, panneau recette, liste de courses
│   └── recipes/               # Formulaire de création
└── app.routes.ts
```

## Démarrage

### Prérequis

- Node.js 22+ (LTS recommandé)
- npm

### Installation

```bash
npm install
```

### Serveur de développement

```bash
npm start
```

Ouvrir [http://localhost:4200](http://localhost:4200).

### Build de production

```bash
npm run build
```

Les artefacts sont générés dans `dist/meal-planner/`.

## Parcours de test manuel

1. Créer une recette via « + Nouvelle recette »
2. Assigner la recette à un créneau vide
3. Consulter la liste de courses et cocher des articles
4. Importer une recette depuis TheMealDB
5. Recharger la page → vérifier que planning, recettes et cases cochées sont conservés
