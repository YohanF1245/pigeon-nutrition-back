const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     StatistiquesJournalieres:
 *       type: object
 *       properties:
 *         repas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               nom:
 *                 type: string
 *               compositions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CompositionRepas'
 *               statistiques:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/StatistiqueRepas'
 *     ApportsNutritionnels:
 *       type: object
 *       properties:
 *         moyennes:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *             glucides:
 *               type: number
 *             proteines:
 *               type: number
 *             lipides:
 *               type: number
 *             sel:
 *               type: number
 *         totaux:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *             glucides:
 *               type: number
 *             proteines:
 *               type: number
 *             lipides:
 *               type: number
 *             sel:
 *               type: number
 *     TendanceConsommation:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         calories:
 *           type: number
 *         glucides:
 *           type: number
 *         proteines:
 *           type: number
 *         lipides:
 *           type: number
 *         sel:
 *           type: number
 */

/**
 * @swagger
 * /api/dashboard/statistiques-journalieres:
 *   get:
 *     summary: Obtenir les statistiques journalières
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date pour les statistiques (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Statistiques journalières récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatistiquesJournalieres'
 */
router.get('/statistiques-journalieres', authMiddleware, DashboardController.getStatistiquesJournalieres);

/**
 * @swagger
 * /api/dashboard/apports-nutritionnels:
 *   get:
 *     summary: Obtenir les apports nutritionnels sur une période
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateDebut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (format YYYY-MM-DD)
 *       - in: query
 *         name: dateFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Apports nutritionnels récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApportsNutritionnels'
 */
router.get('/apports-nutritionnels', authMiddleware, DashboardController.getApportsNutritionnels);

/**
 * @swagger
 * /api/dashboard/stocks-bas:
 *   get:
 *     summary: Obtenir la liste des produits avec un stock bas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits avec un stock bas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produit'
 */
router.get('/stocks-bas', authMiddleware, DashboardController.getStocksBas);

/**
 * @swagger
 * /api/dashboard/tendances:
 *   get:
 *     summary: Obtenir les tendances de consommation
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombreJours
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 30
 *         description: Nombre de jours pour les tendances
 *     responses:
 *       200:
 *         description: Tendances de consommation récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TendanceConsommation'
 */
router.get('/tendances', authMiddleware, DashboardController.getTendancesConsommation);

/**
 * @swagger
 * /api/dashboard/rapport:
 *   post:
 *     summary: Générer un rapport nutritionnel
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateDebut
 *               - dateFin
 *             properties:
 *               dateDebut:
 *                 type: string
 *                 format: date
 *               dateFin:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Rapport nutritionnel généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RapportNutritionnel'
 */
router.post('/rapport', authMiddleware, DashboardController.genererRapportNutritionnel);

module.exports = router; 