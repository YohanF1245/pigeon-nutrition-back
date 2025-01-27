const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/produit.controller');
const produitValidationRules = require('../validators/produit.validator');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Produit:
 *       type: object
 *       required:
 *         - nom
 *         - calories
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré du produit
 *         nom:
 *           type: string
 *           description: Nom du produit
 *         code_barre:
 *           type: string
 *           description: Code barre du produit
 *         calories:
 *           type: number
 *           description: Calories pour 100g
 *         matieres_grasses:
 *           type: number
 *           description: Matières grasses pour 100g
 *         glucides:
 *           type: number
 *           description: Glucides pour 100g
 *         proteines:
 *           type: number
 *           description: Protéines pour 100g
 *         sel:
 *           type: number
 *           description: Sel pour 100g
 *         stock:
 *           type: number
 *           description: Quantité en stock
 *         prix_unitaire:
 *           type: number
 *           description: Prix unitaire
 *         limite_stock:
 *           type: number
 *           description: Limite de stock
 */

/**
 * @swagger
 * /api/produits:
 *   get:
 *     summary: Récupère tous les produits
 *     security:
 *       - bearerAuth: []
 *     tags: [Produits]
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produit'
 *       401:
 *         description: Non autorisé
 */
router.get('/', authMiddleware, ProduitController.lister);

/**
 * @swagger
 * /api/produits:
 *   post:
 *     summary: Crée un nouveau produit
 *     security:
 *       - bearerAuth: []
 *     tags: [Produits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produit'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       401:
 *         description: Non autorisé
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware, produitValidationRules.creer, ProduitController.creer);

/**
 * @swagger
 * /api/produits/{id}:
 *   get:
 *     summary: Récupère un produit par son ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produit'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
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