# Pigeon Nutrition API

API de gestion de valeurs nutritionnelles pour les produits alimentaires.

## Fonctionnalités

- Gestion complète des utilisateurs avec authentification JWT
- Gestion des produits alimentaires avec leurs valeurs nutritionnelles
- Support de différentes unités de stock (Unité, Pourcentage, Tranche)
- Calcul des valeurs nutritionnelles par tranche
- Gestion des stocks avec système d'alertes
- Documentation Swagger interactive

## Installation avec Docker (Recommandé)

1. Clonez le repository
```bash
git clone https://github.com/votre-username/pigeon-nutrition-back.git
cd pigeon-nutrition-back
```

2. Créez un fichier `.env` basé sur `.env.example`
```bash
cp .env.example .env
```

3. Lancez les conteneurs avec Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up --build
```

L'application sera disponible sur :
- API : http://localhost:3000
- Documentation Swagger : http://localhost:3000/api-docs
- PGAdmin : http://localhost:5050

## Installation Manuelle

1. Prérequis
- Node.js 18+
- PostgreSQL 15+

2. Installation des dépendances
```bash
npm install
```

3. Configuration
- Créez un fichier `.env` basé sur `.env.example`
- Configurez les variables d'environnement selon votre environnement

4. Initialisation de la base de données
```bash
npx prisma generate
npx prisma migrate deploy
```

5. Démarrage
```bash
npm run dev
```

## Structure de la Base de Données

### Tables Principales
- `utilisateurs` : Gestion des utilisateurs et authentification
- `produits` : Stockage des produits et leurs valeurs nutritionnelles
- `repas` : Gestion des repas
- `composition_repas` : Association entre les repas et les produits
- `statistiques_repas` : Statistiques nutritionnelles des repas
- `rapports_nutritionnels` : Rapports nutritionnels périodiques

## Routes API

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
- PATCH /api/produits/:id/stock - Mettre à jour le stock
- GET /api/produits/stocks/bas - Vérifier les stocks bas
- GET /api/produits/:id/valeurs-nutritionnelles-tranche - Valeurs nutritionnelles par tranche

### Repas
- GET /api/repas - Liste des repas
- POST /api/repas - Créer un repas
- GET /api/repas/:id - Détails d'un repas
- PUT /api/repas/:id - Modifier un repas
- DELETE /api/repas/:id - Supprimer un repas
- POST /api/repas/:id/compositions - Ajouter des produits au repas
- PUT /api/repas/:id/compositions - Modifier les produits du repas
- DELETE /api/repas/:id/compositions - Supprimer des produits du repas
- GET /api/repas/:id/statistiques - Obtenir les statistiques nutritionnelles
- GET /api/repas/utilisateur/:id/rapport - Obtenir le rapport nutritionnel

### Dashboard
- GET /api/dashboard/statistiques-journalieres - Statistiques journalières
- GET /api/dashboard/apports-nutritionnels - Apports nutritionnels sur une période
- GET /api/dashboard/stocks-bas - Liste des produits en stock bas
- GET /api/dashboard/tendances - Tendances de consommation
- POST /api/dashboard/rapport - Générer un rapport nutritionnel

## Développement

### Scripts Disponibles
- `npm run dev` : Démarrage en mode développement
- `npm run prisma:generate` : Génération du client Prisma
- `npm run prisma:migrate` : Application des migrations
- `npm run prisma:studio` : Interface de gestion de la base de données

### Docker
- `docker-compose -f docker-compose.dev.yml up --build` : Lancement de l'environnement de développement
- `docker-compose -f docker-compose.dev.yml down -v` : Arrêt et nettoyage

## Documentation

La documentation complète de l'API est disponible via Swagger UI à l'adresse `/api-docs` une fois l'application lancée. 