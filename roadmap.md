# Roadmap du Projet Pigeon Nutrition

## Phase 1 : Configuration et Base de Données (Semaine 1)
- [x] Initialisation du projet Express.js
- [x] Configuration de la base de données PostgreSQL
- [x] Mise en place des middlewares essentiels
- [x] Configuration des variables d'environnement
- [x] Migration vers Prisma ORM
- [x] Configuration du schéma Prisma
- [x] Mise en place des migrations automatiques

## Phase 2 : Gestion des Utilisateurs (Semaine 2)
- [x] Création du modèle Prisma pour les utilisateurs
- [x] Mise en place de l'authentification JWT
- [x] Création des roles utilisateurs
- [x] Endpoints de gestion des utilisateurs :
  - [x] Inscription
  - [x] Connexion
  - [x] Modification du profil
  - [x] Réinitialisation du mot de passe
- [x] Middleware d'authentification
- [x] Tests des endpoints utilisateurs

## Phase 3 : Gestion des Produits (Semaine 3)
- [x] Création du modèle Prisma pour les produits
- [x] Validation des données produits
- [x] Gestion des stocks et alertes
- [x] Tests des endpoints produits
- [x] Documentation des endpoints produits
- [x] Gestion des unités de stock (UNITE, POURCENTAGE, TRANCHE)
- [x] Calcul des valeurs nutritionnelles par tranche

## Phase 4 : Gestion des Repas (Semaine 4)
- [x] Création du modèle Prisma pour les repas
- [x] Création du modèle Prisma pour les compositions de repas
- [x] Création du modèle Prisma pour les statistiques de repas
- [x] Création du modèle Prisma pour les rapports nutritionnels
- [x] Implémentation du modèle RepasModel
- [x] Implémentation du contrôleur RepasController
- [x] Implémentation des routes de repas
- [x] Implémentation des validateurs de repas
- [x] Documentation Swagger des endpoints repas
- [x] Tests des endpoints repas
- [x] Gestion des compositions de repas
- [x] Calculs nutritionnels des repas

## Phase 5 : Dashboard et Analytics (Semaine 5)
- [x] Endpoints pour les statistiques journalières
- [x] Calcul des apports nutritionnels
- [x] Système d'alerte de stock
- [x] Visualisation des tendances
- [x] Génération de rapports nutritionnels
- [x] Documentation Swagger des endpoints dashboard
- [x] Tests des endpoints dashboard

### Fonctionnalités du Dashboard
- [x] Statistiques journalières des repas
- [x] Calcul des moyennes nutritionnelles
- [x] Suivi des tendances de consommation
- [x] Alertes de stock bas
- [x] Rapports nutritionnels personnalisés
- [x] Visualisation des données sur différentes périodes

## Phase 6 : Optimisation et Sécurité (Semaine 6)
- [ ] Optimisation des requêtes Prisma
- [ ] Mise en cache des données fréquemment utilisées
- [ ] Sécurisation des endpoints
- [ ] Tests de charge
- [ ] Audit de sécurité

## Phase 7 : Documentation et Déploiement (Semaine 7)
- [x] Configuration Docker de développement
- [x] Configuration Docker Compose
- [x] Documentation Swagger de base
- [x] Données de test et route de seeding
- [ ] Documentation complète de l'API
- [ ] Guide d'installation
- [ ] Guide d'utilisation
- [ ] Configuration de production
- [ ] Déploiement en production
- [ ] Monitoring et logging

## Fonctionnalités Implémentées

### Gestion des Utilisateurs
- [x] Inscription avec validation des données
- [x] Connexion sécurisée avec JWT
- [x] Gestion du profil utilisateur
- [x] Réinitialisation du mot de passe
- [x] Gestion des rôles (USER, ADMIN)

### Gestion des Produits
- [x] CRUD complet des produits
- [x] Validation des données produits
- [x] Gestion des stocks avec alertes
- [x] Support de différentes unités de stock
- [x] Calcul des valeurs nutritionnelles par tranche
- [x] Vérification des stocks bas
- [x] Documentation Swagger complète

### Infrastructure
- [x] Configuration Docker multi-conteneurs
- [x] Base de données PostgreSQL
- [x] PGAdmin pour la gestion de la base de données
- [x] Migrations automatiques avec Prisma
- [x] Variables d'environnement sécurisées
- [x] Route de seeding pour les données de test

## Outils et Technologies

### Base de données
- PostgreSQL comme base de données principale
- Prisma comme ORM
- Migrations automatiques avec Prisma
- Studio Prisma pour la visualisation des données

### Backend
- Express.js pour l'API REST
- JWT pour l'authentification
- Swagger pour la documentation API
- Validation des données avec Express Validator

### DevOps
- Docker pour la conteneurisation
- Docker Compose pour l'orchestration
- Scripts automatisés pour les migrations
- Environnements de développement et production séparés

## 1. Règles de Gestion
- Un produit doit avoir un nom unique et un code-barres unique
- Les valeurs nutritionnelles sont exprimées pour 100g
- Le stock peut être exprimé en nombre entier ou en pourcentage (0-100%)
- La valeur limite de stock doit être définie pour chaque produit
- Un repas est composé d'un ou plusieurs produits avec leurs quantités
- Les calculs nutritionnels des repas sont basés sur les quantités réelles utilisées
- Le suivi nutritionnel est fait sur une base journalière

## 2. Dictionnaire de Données

### Produit
- **id**: Identifiant unique (UUID)
- **nom**: Chaîne de caractères (100)
- **code_barre**: Chaîne de caractères (13)
- **calories**: Décimal (calories/100g)
- **matieres_grasses**: Décimal (g/100g)
- **glucides**: Décimal (g/100g)
- **proteines**: Décimal (g/100g)
- **sel**: Décimal (g/100g)
- **stock**: Décimal
- **unite_stock**: Enum ('UNITE', 'POURCENTAGE')
- **prix_unitaire**: Décimal
- **stock_limite**: Décimal
- **date_creation**: Date
- **date_modification**: Date

### Repas
- **id**: Identifiant unique (UUID)
- **nom**: Chaîne de caractères (100)
- **date**: Date
- **description**: Texte
- **date_creation**: Date
- **date_modification**: Date

### CompositionRepas
- **id**: Identifiant unique (UUID)
- **repas_id**: UUID (clé étrangère)
- **produit_id**: UUID (clé étrangère)
- **quantite**: Décimal
- **date_creation**: Date

## 3. Structure de la Base de Données SQL
```sql
-- Types énumérés
CREATE TYPE unite_stock_type AS ENUM ('UNITE', 'POURCENTAGE');

-- Table des produits
CREATE TABLE produits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    code_barre VARCHAR(13) NOT NULL UNIQUE,
    calories DECIMAL(10,2) NOT NULL,
    matieres_grasses DECIMAL(10,2) NOT NULL,
    glucides DECIMAL(10,2) NOT NULL,
    proteines DECIMAL(10,2) NOT NULL,
    sel DECIMAL(10,2) NOT NULL,
    stock DECIMAL(10,2) NOT NULL,
    unite_stock unite_stock_type NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    stock_limite DECIMAL(10,2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des repas
CREATE TABLE repas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de composition des repas
CREATE TABLE composition_repas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repas_id UUID REFERENCES repas(id),
    produit_id UUID REFERENCES produits(id),
    quantite DECIMAL(10,2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_repas FOREIGN KEY (repas_id) REFERENCES repas(id) ON DELETE CASCADE,
    CONSTRAINT fk_produit FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);
```
## 4. User Stories

### Gestion des Produits
- En tant qu'utilisateur, je peux ajouter un nouveau produit avec ses informations nutritionnelles
- En tant qu'utilisateur, je peux modifier les informations d'un produit existant
- En tant qu'utilisateur, je peux supprimer un produit
- En tant qu'utilisateur, je peux consulter la liste de tous mes produits
- En tant qu'utilisateur, je peux rechercher un produit par son nom ou code-barres
- En tant qu'utilisateur, je peux mettre à jour le stock d'un produit

### Gestion des Repas
- En tant qu'utilisateur, je peux créer un nouveau repas
- En tant qu'utilisateur, je peux ajouter des produits à un repas avec leurs quantités
- En tant qu'utilisateur, je peux modifier la composition d'un repas
- En tant qu'utilisateur, je peux supprimer un repas
- En tant qu'utilisateur, je peux voir les valeurs nutritionnelles totales d'un repas

### Dashboard
- En tant qu'utilisateur, je peux voir mes apports nutritionnels journaliers
- En tant qu'utilisateur, je peux voir l'historique de mes repas
- En tant qu'utilisateur, je peux être alerté quand un produit atteint sa limite de stock

## 5. Roadmap de l'API

### Phase 1 : Configuration Initiale (Semaine 1)
- Mise en place du projet Express.js
- Configuration de la base de données PostgreSQL
- Mise en place des middlewares essentiels (cors, bodyParser, etc.)
- Configuration des variables d'environnement

### Phase 2 : Gestion des Produits (Semaine 2)
- Création des routes CRUD pour les produits
- Implémentation de la validation des données
- Tests des endpoints produits
- Documentation des endpoints produits

### Phase 3 : Gestion des Repas (Semaine 3)
- Création des routes CRUD pour les repas
- Implémentation des calculs nutritionnels
- Tests des endpoints repas
- Documentation des endpoints repas

### Phase 4 : Dashboard et Fonctionnalités Avancées (Semaine 4)
- Endpoints pour les statistiques journalières
- Système d'alerte de stock
- Routes pour les rapports nutritionnels
- Tests d'intégration

### Phase 5 : Finalisation (Semaine 5)
- Optimisation des performances
- Documentation complète de l'API
- Tests de charge
- Déploiement