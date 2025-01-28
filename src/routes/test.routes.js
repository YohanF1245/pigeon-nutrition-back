const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/test/seed:
 *   post:
 *     summary: Remplir la base de données avec des données de test
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Base de données remplie avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     utilisateurs:
 *                       type: array
 *                     produits:
 *                       type: array
 *                     repas:
 *                       type: array
 */
router.post('/seed', async (req, res) => {
    try {
        // Créer un utilisateur de test
        const utilisateur = await prisma.utilisateur.create({
            data: {
                email: 'test@test.com',
                mot_de_passe: '$2b$10$YourHashedPassword', // À remplacer par un vrai hash
                nom: 'Test',
                prenom: 'User',
                role: 'USER'
            }
        });

        // Créer des produits de test
        const produits = await prisma.produit.createMany({
            data: [
                {
                    nom: 'Pomme',
                    code_barre: '1234567890123',
                    calories: 52,
                    matieres_grasses: 0.2,
                    glucides: 14,
                    proteines: 0.3,
                    sel: 0,
                    stock: 10,
                    unite_stock: 'UNITE',
                    prix_unitaire: 0.5,
                    stock_limite: 5,
                    utilisateur_id: utilisateur.id
                },
                {
                    nom: 'Pain',
                    code_barre: '3210987654321',
                    calories: 265,
                    matieres_grasses: 1.2,
                    glucides: 53,
                    proteines: 9,
                    sel: 1.2,
                    stock: 3,
                    unite_stock: 'UNITE',
                    prix_unitaire: 1.2,
                    stock_limite: 2,
                    utilisateur_id: utilisateur.id
                },
                {
                    nom: 'Poulet',
                    code_barre: '4567890123456',
                    calories: 165,
                    matieres_grasses: 3.6,
                    glucides: 0,
                    proteines: 31,
                    sel: 0.7,
                    stock: 5,
                    unite_stock: 'UNITE',
                    prix_unitaire: 4.5,
                    stock_limite: 2,
                    utilisateur_id: utilisateur.id
                }
            ]
        });

        // Créer des repas de test
        const repas = await prisma.repas.create({
            data: {
                nom: 'Déjeuner test',
                date: new Date(),
                description: 'Un repas de test équilibré',
                utilisateur: {
                    connect: { id: utilisateur.id }
                }
            }
        });

        res.json({
            message: 'Base de données remplie avec succès',
            data: {
                utilisateurs: [utilisateur],
                produits,
                repas: [repas]
            }
        });
    } catch (error) {
        console.error('Erreur lors du remplissage de la base de données:', error);
        res.status(500).json({
            message: 'Erreur lors du remplissage de la base de données',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

module.exports = router; 