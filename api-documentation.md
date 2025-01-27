# Documentation de l'API Pigeon Nutrition

## Table des matières
1. [Authentification](#authentification)
2. [Produits](#produits)
   - [Gestion des produits](#gestion-des-produits)
   - [Gestion des stocks](#gestion-des-stocks)
   - [Valeurs nutritionnelles](#valeurs-nutritionnelles)

## Base URL
```
http://localhost:3000/api
```

## Authentification

### Inscription
```http
POST /auth/register
```

**Corps de la requête**
```json
{
  "email": "utilisateur@example.com",
  "mot_de_passe": "motdepasse123",
  "nom": "Dupont",
  "prenom": "Jean"
}
```

**Réponse (201)**
```json
{
  "message": "Utilisateur créé avec succès",
  "token": "jwt_token",
  "utilisateur": {
    "id": "uuid",
    "email": "utilisateur@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "USER"
  }
}
```

### Connexion
```http
POST /auth/login
```

**Corps de la requête**
```json
{
  "email": "utilisateur@example.com",
  "mot_de_passe": "motdepasse123"
}
```

**Réponse (200)**
```json
{
  "message": "Connexion réussie",
  "token": "jwt_token",
  "utilisateur": {
    "id": "uuid",
    "email": "utilisateur@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "USER"
  }
}
```

### Profil utilisateur
```http
GET /auth/profile
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Réponse (200)**
```json
{
  "utilisateur": {
    "id": "uuid",
    "email": "utilisateur@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "USER"
  }
}
```

## Produits

### Créer un produit
```http
POST /produits
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Corps de la requête pour un produit normal**
```json
{
  "nom": "Riz blanc",
  "code_barre": "3760020507350",
  "calories": 130,
  "matieres_grasses": 0.3,
  "glucides": 28,
  "proteines": 2.7,
  "sel": 0.01,
  "stock": 100,
  "unite_stock": "UNITE",
  "prix_unitaire": 1.99,
  "stock_limite": 20
}
```

**Corps de la requête pour un produit en tranches**
```json
{
  "nom": "Pain de mie",
  "code_barre": "3760020507351",
  "calories": 265,
  "matieres_grasses": 4.5,
  "glucides": 49,
  "proteines": 8,
  "sel": 1.2,
  "stock": 24,
  "unite_stock": "TRANCHE",
  "prix_unitaire": 2.49,
  "stock_limite": 6,
  "poids_par_tranche": 30
}
```

**Réponse (201) pour un produit en tranches**
```json
{
  "message": "Produit créé avec succès",
  "produit": {
    "id": "uuid",
    "nom": "Pain de mie",
    "code_barre": "3760020507351",
    "calories": 265,
    "matieres_grasses": 4.5,
    "glucides": 49,
    "proteines": 8,
    "sel": 1.2,
    "stock": 24,
    "unite_stock": "TRANCHE",
    "prix_unitaire": 2.49,
    "stock_limite": 6,
    "poids_par_tranche": 30,
    "date_creation": "2024-01-27T10:30:00Z",
    "date_modification": "2024-01-27T10:30:00Z"
  }
}
```

### Lister les produits
```http
GET /produits?page=1&limite=10&recherche=riz
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Paramètres de requête**
- `page` (optionnel): Numéro de la page (défaut: 1)
- `limite` (optionnel): Nombre d'éléments par page (défaut: 10)
- `recherche` (optionnel): Terme de recherche pour filtrer les produits

**Réponse (200)**
```json
{
  "produits": [
    {
      "id": "uuid",
      "nom": "Riz blanc",
      "code_barre": "3760020507350",
      "calories": 130,
      "matieres_grasses": 0.3,
      "glucides": 28,
      "proteines": 2.7,
      "sel": 0.01,
      "stock": 100,
      "unite_stock": "UNITE",
      "prix_unitaire": 1.99,
      "stock_limite": 20,
      "date_creation": "2024-01-27T10:30:00Z",
      "date_modification": "2024-01-27T10:30:00Z"
    }
  ]
}
```

### Récupérer un produit
```http
GET /produits/:id
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Réponse (200)**
```json
{
  "produit": {
    "id": "uuid",
    "nom": "Riz blanc",
    "code_barre": "3760020507350",
    "calories": 130,
    "matieres_grasses": 0.3,
    "glucides": 28,
    "proteines": 2.7,
    "sel": 0.01,
    "stock": 100,
    "unite_stock": "UNITE",
    "prix_unitaire": 1.99,
    "stock_limite": 20,
    "date_creation": "2024-01-27T10:30:00Z",
    "date_modification": "2024-01-27T10:30:00Z"
  }
}
```

### Mettre à jour un produit
```http
PUT /produits/:id
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Corps de la requête**
```json
{
  "nom": "Riz blanc bio",
  "prix_unitaire": 2.49
}
```

**Réponse (200)**
```json
{
  "message": "Produit mis à jour avec succès",
  "produit": {
    "id": "uuid",
    "nom": "Riz blanc bio",
    "code_barre": "3760020507350",
    "calories": 130,
    "matieres_grasses": 0.3,
    "glucides": 28,
    "proteines": 2.7,
    "sel": 0.01,
    "stock": 100,
    "unite_stock": "UNITE",
    "prix_unitaire": 2.49,
    "stock_limite": 20,
    "date_creation": "2024-01-27T10:30:00Z",
    "date_modification": "2024-01-27T10:31:00Z"
  }
}
```

### Supprimer un produit
```http
DELETE /produits/:id
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Réponse (200)**
```json
{
  "message": "Produit supprimé avec succès",
  "produit": {
    "id": "uuid",
    "nom": "Riz blanc bio"
  }
}
```

### Mettre à jour le stock
```http
PATCH /produits/:id/stock
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Corps de la requête**
```json
{
  "quantite": -5  // Négatif pour retirer, positif pour ajouter
}
```

**Réponse (200)**
```json
{
  "message": "Stock mis à jour avec succès",
  "produit": {
    "id": "uuid",
    "nom": "Riz blanc bio",
    "stock": 95,
    "stock_limite": 20
  }
}
```

**Réponse en cas de stock bas (200)**
```json
{
  "message": "Stock mis à jour avec succès - ATTENTION: Stock bas",
  "produit": {
    "id": "uuid",
    "nom": "Riz blanc bio",
    "stock": 15,
    "stock_limite": 20
  },
  "alerte": "Stock bas"
}
```

### Vérifier les stocks bas
```http
GET /produits/stocks/bas
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Réponse (200)**
```json
{
  "message": "Produits avec stock bas trouvés",
  "produits": [
    {
      "id": "uuid",
      "nom": "Riz blanc bio",
      "stock": 15,
      "stock_limite": 20
    }
  ]
}
```

### Obtenir les valeurs nutritionnelles par tranche
```http
GET /produits/:id/valeurs-nutritionnelles-tranche
```

**Headers**
```
Authorization: Bearer jwt_token
```

**Réponse (200)**
```json
{
  "nom": "Pain de mie",
  "poids_par_tranche": 30,
  "calories_par_tranche": 79.5,
  "matieres_grasses_par_tranche": 1.35,
  "glucides_par_tranche": 14.7,
  "proteines_par_tranche": 2.4,
  "sel_par_tranche": 0.36
}
```

## Notes importantes

1. Toutes les requêtes (sauf inscription et connexion) nécessitent un token JWT valide dans le header `Authorization`.
2. Les valeurs nutritionnelles sont exprimées pour 100g de produit.
3. Le stock peut être exprimé en :
   - Unités (UNITE)
   - Pourcentage (POURCENTAGE, 0-100%)
   - Tranches (TRANCHE)
4. Pour les produits en tranches :
   - Le champ `poids_par_tranche` est obligatoire et représente le poids en grammes d'une tranche
   - Le stock et la limite de stock sont exprimés en nombre de tranches
   - Les valeurs nutritionnelles peuvent être obtenues par tranche via l'endpoint dédié
5. Une alerte est générée lorsque le stock d'un produit atteint ou passe sous sa limite.

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Création réussie |
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Non autorisé |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur |

## Exemples d'erreurs spécifiques

### Erreur de validation des tranches
```json
{
  "errors": [
    {
      "msg": "Le poids par tranche est requis pour les produits en tranches",
      "param": "poids_par_tranche",
      "location": "body"
    }
  ]
}
```

### Erreur de stock bas (Tranches)
```json
{
  "message": "Stock mis à jour avec succès - ATTENTION: Stock bas",
  "produit": {
    "id": "uuid",
    "nom": "Pain de mie",
    "stock": 5,
    "stock_limite": 6,
    "unite_stock": "TRANCHE",
    "poids_par_tranche": 30
  },
  "alerte": "Stock bas"
}
``` 