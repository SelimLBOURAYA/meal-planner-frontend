# Planificateur de repas

Maquette Angular d'un planificateur de repas hebdomadaire, alimentée par des **données stub** (aucun backend requis).

## Fonctionnalités

### Planning hebdomadaire

- Grille **7 jours × 3 repas** : petit-déjeuner, déjeuner et dîner
- Affichage des repas planifiés avec emoji, nom, durée totale et calories
- Mise en évidence du **jour courant**
- Créneaux vides affichés avec un libellé « + Ajouter » (non fonctionnel — maquette uniquement)

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

- Panneau latéral affiché au clic sur un repas
- Pour chaque recette :
  - Nom, description et tags (rapide, végétarien, etc.)
  - Temps de préparation, cuisson, nombre de portions et calories
  - Liste des **ingrédients** avec quantités
- État vide invitant à sélectionner un repas dans la grille

### Liste de courses

- Liste d'ingrédients agrégés pour la semaine (données stub)
- **Cases à cocher** pour marquer les articles achetés
- **Barre de progression** (articles cochés / total)
- Texte barré pour les articles déjà cochés

### Données stub

- **10 recettes** prédéfinies (overnight oats, carbonara, curry de lentilles, saumon en papillote, etc.)
- **Planning généré** automatiquement pour la semaine affichée
- **Liste de courses** statique avec quelques articles déjà cochés

## Stack technique

- [Angular 19](https://angular.dev/) (composants standalone)
- [Signals](https://angular.dev/guide/signals) pour l'état réactif
- SCSS pour le style
- TypeScript 5.7

## Structure du projet

```
src/app/
├── models/meal.models.ts           # Types (Recipe, PlannedMeal, MealType…)
├── data/stub.data.ts                 # Recettes, planning et liste de courses
├── services/meal-planner.service.ts  # Logique métier et état
├── components/
│   ├── meal-slot/                    # Cellule repas dans la grille
│   ├── recipe-panel/                 # Panneau de détail recette
│   └── shopping-list/                # Liste de courses
└── pages/planner/                    # Page principale
```

## Démarrage

### Prérequis

- Node.js 18+
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

## Limites de la maquette

Cette version est une **maquette UI** : les données sont en dur, l'ajout ou la modification de repas n'est pas implémenté, et aucune persistance (localStorage, API) n'est prévue.
