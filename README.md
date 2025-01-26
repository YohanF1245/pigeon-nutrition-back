# Pigeon Nutrition API

API de gestion de valeurs nutritionnelles pour les produits alimentaires.

## Installation

```bash
npm install
```

## Configuration

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez les variables d'environnement suivantes :
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pigeon_nutrition
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
```

## Structure de la Base de Données

La base de données comprend quatre tables principales :
- `utilisateurs` : Gestion des utilisateurs et authentification
- `produits` : Stockage des produits et leurs valeurs nutritionnelles
- `repas` : Gestion des repas
- `composition_repas` : Association entre les repas et les produits

## Démarrage

```bash
npm start
```

## Routes Principales

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- GET /api/auth/profile - Obtenir le profil
- PUT /api/auth/profile - Modifier le profil
- POST /api/auth/reset-password - Réinitialiser le mot de passe

### Produits
- GET /api/produits - Liste des produits
- POST /api/produits - Créer un produit
- GET /api/produits/:id - Détails d'un produit
- PUT /api/produits/:id - Modifier un produit
- DELETE /api/produits/:id - Supprimer un produit

### Repas
- GET /api/repas - Liste des repas
- POST /api/repas - Créer un repas
- GET /api/repas/:id - Détails d'un repas
- PUT /api/repas/:id - Modifier un repas
- DELETE /api/repas/:id - Supprimer un repas

### Dashboard
- GET /api/dashboard/journalier - Statistiques journalières
- GET /api/dashboard/stock-alerts - Alertes de stock 