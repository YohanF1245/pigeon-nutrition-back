const express = require('express');
const router = express.Router();
const RepasController = require('../controllers/repas.controller');
const { repasValidationRules } = require('../validators/repas.validator');
const { verifierToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Repas:
 *       type: object
 *       required:
 *         - nom
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID auto-généré du repas
 *         nom:
 *           type: string
 *           description: Nom du repas
 *         date:
 *           type: string
 *           format: date
 *           description: Date du repas (YYYY-MM-DD)
 *         description:
 *           type: string
 *           description: Description optionnelle du repas
 *         compositions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompositionRepas'
 *         nutriments:
 *           type: object
 *           properties:
 *             calories_total:
 *               type: number
 *               description: Total des calories du repas
 *             matieres_grasses_total:
 *               type: number
 *               description: Total des matières grasses du repas
 *             glucides_total:
 *               type: number
 *               description: Total des glucides du repas
 *             proteines_total:
 *               type: number
 *               description: Total des protéines du repas
 *             sel_total:
 *               type: number
 *               description: Total du sel du repas
 *     CompositionRepas:
 *       type: object
 *       required:
 *         - produit_id
 *         - quantite
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID auto-généré de la composition
 *         produit_id:
 *           type: string
 *           format: uuid
 *           description: ID du produit
 *         quantite:
 *           type: number
 *           description: Quantité du produit dans le repas
 */

// Routes protégées par authentification
router.use(verifierToken);

/**
 * @swagger
 * /api/repas:
 *   post:
 *     summary: Créer un nouveau repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - date
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Repas créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Repas'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/', repasValidationRules.creer, RepasController.creer);

/**
 * @swagger
 * /api/repas:
 *   get:
 *     summary: Lister tous les repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des repas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 repas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Repas'
 */
router.get('/', RepasController.lister);

/**
 * @swagger
 * /api/repas/{id}:
 *   get:
 *     summary: Récupérer un repas par son ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du repas
 *     responses:
 *       200:
 *         description: Détails du repas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Repas'
 *       404:
 *         description: Repas non trouvé
 */
router.get('/:id', RepasController.recuperer);

/**
 * @swagger
 * /api/repas/{id}:
 *   put:
 *     summary: Mettre à jour un repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du repas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Repas mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Repas'
 *       404:
 *         description: Repas non trouvé
 */
router.put('/:id', repasValidationRules.mettreAJour, RepasController.mettreAJour);

/**
 * @swagger
 * /api/repas/{id}:
 *   delete:
 *     summary: Supprimer un repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du repas
 *     responses:
 *       200:
 *         description: Repas supprimé avec succès
 *       404:
 *         description: Repas non trouvé
 */
router.delete('/:id', RepasController.supprimer);

/**
 * @swagger
 * /api/repas/{id}/produits:
 *   post:
 *     summary: Ajouter un produit à un repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du repas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produit_id
 *               - quantite
 *             properties:
 *               produit_id:
 *                 type: string
 *                 format: uuid
 *               quantite:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Produit ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 composition:
 *                   $ref: '#/components/schemas/CompositionRepas'
 *                 nutriments:
 *                   type: object
 *                   properties:
 *                     calories_total:
 *                       type: number
 *                     matieres_grasses_total:
 *                       type: number
 *                     glucides_total:
 *                       type: number
 *                     proteines_total:
 *                       type: number
 *                     sel_total:
 *                       type: number
 */
router.post('/:id/produits', repasValidationRules.ajouterProduit, RepasController.ajouterProduit);

/**
 * @swagger
 * /api/repas/{id}/produits/{composition_id}:
 *   delete:
 *     summary: Supprimer un produit d'un repas
 *     security:
 *       - bearerAuth: []
 *     tags: [Repas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du repas
 *       - in: path
 *         name: composition_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la composition à supprimer
 *     responses:
 *       200:
 *         description: Produit retiré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 composition:
 *                   $ref: '#/components/schemas/CompositionRepas'
 *                 nutriments:
 *                   type: object
 *                   properties:
 *                     calories_total:
 *                       type: number
 *                     matieres_grasses_total:
 *                       type: number
 *                     glucides_total:
 *                       type: number
 *                     proteines_total:
 *                       type: number
 *                     sel_total:
 *                       type: number
 *       404:
 *         description: Composition non trouvée
 */
router.delete('/:id/produits/:composition_id', RepasController.supprimerProduit);

module.exports = router; 