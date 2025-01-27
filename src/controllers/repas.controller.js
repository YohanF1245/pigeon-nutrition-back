const { validationResult } = require('express-validator');
const RepasModel = require('../models/repas.model');

class RepasController {
    static async creer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repasData = {
                ...req.body,
                utilisateur_id: req.user.id
            };

            const repas = await RepasModel.creer(repasData);
            res.status(201).json({
                message: 'Repas créé avec succès',
                repas
            });
        } catch (error) {
            console.error('Erreur lors de la création du repas:', error);
            res.status(500).json({ message: 'Erreur lors de la création du repas' });
        }
    }

    static async lister(req, res) {
        try {
            const { date, page, limite } = req.query;
            const repas = await RepasModel.lister(req.user.id, {
                date: date ? new Date(date) : null,
                page: parseInt(page) || 1,
                limite: parseInt(limite) || 10
            });

            res.json({ repas });
        } catch (error) {
            console.error('Erreur lors de la récupération des repas:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des repas' });
        }
    }

    static async recuperer(req, res) {
        try {
            const repas = await RepasModel.trouverParId(req.params.id, req.user.id);
            if (!repas) {
                return res.status(404).json({ message: 'Repas non trouvé' });
            }

            // Calculer les valeurs nutritionnelles
            const nutriments = await RepasModel.calculerNutriments(req.params.id, req.user.id);

            res.json({ 
                repas: {
                    ...repas,
                    nutriments
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du repas:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération du repas' });
        }
    }

    static async mettreAJour(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repas = await RepasModel.mettreAJour(req.params.id, req.user.id, req.body);
            if (!repas) {
                return res.status(404).json({ message: 'Repas non trouvé' });
            }

            res.json({
                message: 'Repas mis à jour avec succès',
                repas
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du repas:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du repas' });
        }
    }

    static async supprimer(req, res) {
        try {
            const repas = await RepasModel.supprimer(req.params.id, req.user.id);
            if (!repas) {
                return res.status(404).json({ message: 'Repas non trouvé' });
            }

            res.json({
                message: 'Repas supprimé avec succès',
                repas
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du repas:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du repas' });
        }
    }

    static async ajouterProduit(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Vérifier si le repas existe et appartient à l'utilisateur
            const repas = await RepasModel.trouverParId(req.params.id, req.user.id);
            if (!repas) {
                return res.status(404).json({ message: 'Repas non trouvé' });
            }

            const { produit_id, quantite } = req.body;
            const composition = await RepasModel.ajouterProduit(req.params.id, produit_id, quantite);

            // Recalculer les nutriments
            const nutriments = await RepasModel.calculerNutriments(req.params.id, req.user.id);

            res.json({
                message: 'Produit ajouté au repas avec succès',
                composition,
                nutriments
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit au repas:', error);
            res.status(500).json({ message: 'Erreur lors de l\'ajout du produit au repas' });
        }
    }

    static async supprimerProduit(req, res) {
        try {
            const composition = await RepasModel.supprimerProduit(
                req.params.id,
                req.params.composition_id,
                req.user.id
            );

            if (!composition) {
                return res.status(404).json({ message: 'Produit non trouvé dans le repas' });
            }

            // Recalculer les nutriments
            const nutriments = await RepasModel.calculerNutriments(req.params.id, req.user.id);

            res.json({
                message: 'Produit retiré du repas avec succès',
                composition,
                nutriments
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du produit du repas:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du produit du repas' });
        }
    }
}

module.exports = RepasController; 