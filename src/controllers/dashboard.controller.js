const DashboardModel = require('../models/dashboard.model');

class DashboardController {
    static async getStatistiquesJournalieres(req, res) {
        try {
            const { date } = req.query;
            const statistiques = await DashboardModel.getStatistiquesJournalieres(
                req.user.id,
                date || new Date()
            );
            res.json(statistiques);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques journalières:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des statistiques journalières' 
            });
        }
    }

    static async getApportsNutritionnels(req, res) {
        try {
            const { dateDebut, dateFin } = req.query;
            if (!dateDebut || !dateFin) {
                return res.status(400).json({ 
                    message: 'Les dates de début et de fin sont requises' 
                });
            }

            const apports = await DashboardModel.getApportsNutritionnels(
                req.user.id,
                dateDebut,
                dateFin
            );
            res.json(apports);
        } catch (error) {
            console.error('Erreur lors de la récupération des apports nutritionnels:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des apports nutritionnels' 
            });
        }
    }

    static async getStocksBas(req, res) {
        try {
            const produits = await DashboardModel.getStocksBas(req.user.id);
            res.json(produits);
        } catch (error) {
            console.error('Erreur lors de la récupération des stocks bas:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des stocks bas' 
            });
        }
    }

    static async getTendancesConsommation(req, res) {
        try {
            const { nombreJours } = req.query;
            const tendances = await DashboardModel.getTendancesConsommation(
                req.user.id,
                nombreJours ? parseInt(nombreJours) : 30
            );
            res.json(tendances);
        } catch (error) {
            console.error('Erreur lors de la récupération des tendances:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des tendances' 
            });
        }
    }

    static async genererRapportNutritionnel(req, res) {
        try {
            const { dateDebut, dateFin } = req.body;
            if (!dateDebut || !dateFin) {
                return res.status(400).json({ 
                    message: 'Les dates de début et de fin sont requises' 
                });
            }

            const rapport = await DashboardModel.genererRapportNutritionnel(
                req.user.id,
                dateDebut,
                dateFin
            );
            res.status(201).json(rapport);
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la génération du rapport' 
            });
        }
    }
}

module.exports = DashboardController; 