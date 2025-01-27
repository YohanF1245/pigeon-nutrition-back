const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/produit.controller');
const produitValidationRules = require('../validators/produit.validator');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/produits:
 *   post:
 *     tags: [Produits]
 *     summary: Créer un nouveau produit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - code_barre
 *               - calories
 *               - matieres_grasses
 *               - glucides
 *               - proteines
 *               - sel
 *               - stock
 *               - unite_stock
 *               - prix_unitaire
 *               - stock_limite
 *             properties:
 *               nom:
 *                 type: string
 *               code_barre:
 *                 type: string
 *               calories:
 *                 type: number
 *               matieres_grasses:
 *                 type: number
 *               glucides:
 *                 type: number
 *               proteines:
 *                 type: number
 *               sel:
 *                 type: number
 *               stock:
 *                 type: number
 *               unite_stock:
 *                 type: string
 *                 enum: [UNITE, POURCENTAGE]
 *               prix_unitaire:
 *                 type: number
 *               stock_limite:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 */
router.post('/', authMiddleware, produitValidationRules.creer, ProduitController.creer);

/**
 * @swagger
 * /api/produits:
 *   get:
 *     tags: [Produits]
 *     summary: Lister tous les produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recherche
 *         schema:
 *           type: string
 *         description: Terme de recherche pour filtrer les produits
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/', authMiddleware, ProduitController.lister);

/**
 * @swagger
 * /api/produits/{id}:
 *   get:
 *     tags: [Produits]
 *     summary: Récupérer un produit par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Détails du produit
 */
router.get('/:id', authMiddleware, ProduitController.recuperer);

/**
 * @swagger
 * /api/produits/{id}:
 *   put:
 *     tags: [Produits]
 *     summary: Mettre à jour un produit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               code_barre:
 *                 type: string
 *               calories:
 *                 type: number
 *               matieres_grasses:
 *                 type: number
 *               glucides:
 *                 type: number
 *               proteines:
 *                 type: number
 *               sel:
 *                 type: number
 *               stock:
 *                 type: number
 *               unite_stock:
 *                 type: string
 *                 enum: [UNITE, POURCENTAGE]
 *               prix_unitaire:
 *                 type: number
 *               stock_limite:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 */
router.put('/:id', authMiddleware, produitValidationRules.mettreAJour, ProduitController.mettreAJour);

/**
 * @swagger
 * /api/produits/{id}:
 *   delete:
 *     tags: [Produits]
 *     summary: Supprimer un produit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 */
router.delete('/:id', authMiddleware, ProduitController.supprimer);

/**
 * @swagger
 * /api/produits/{id}/stock:
 *   patch:
 *     tags: [Produits]
 *     summary: Mettre à jour le stock d'un produit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantite
 *             properties:
 *               quantite:
 *                 type: number
 *                 description: Quantité à ajouter (positif) ou retirer (négatif)
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès
 */
router.patch('/:id/stock', authMiddleware, produitValidationRules.mettreAJourStock, ProduitController.mettreAJourStock);

/**
 * @swagger
 * /api/produits/stocks/bas:
 *   get:
 *     tags: [Produits]
 *     summary: Vérifier les produits avec un stock bas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits avec un stock bas
 */
router.get('/stocks/bas', authMiddleware, ProduitController.verifierStocksBas);

/**
 * @swagger
 * /api/produits/{id}/valeurs-nutritionnelles-tranche:
 *   get:
 *     tags: [Produits]
 *     summary: Obtenir les valeurs nutritionnelles par tranche
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Valeurs nutritionnelles par tranche
 *       404:
 *         description: Produit non trouvé ou non géré en tranches
 */
router.get('/:id/valeurs-nutritionnelles-tranche', authMiddleware, ProduitController.getValeursNutritionnellesParTranche);

module.exports = router; 