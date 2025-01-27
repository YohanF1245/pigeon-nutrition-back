const { validationResult } = require('express-validator');
const ProduitModel = require('../models/produit.model');

class ProduitController {
    static async creer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const produitData = {
                ...req.body,
                utilisateur_id: req.user.id
            };

            // Vérifier si le code-barres existe déjà pour cet utilisateur
            const produitExistant = await ProduitModel.trouverParCodeBarre(produitData.code_barre, req.user.id);
            if (produitExistant) {
                return res.status(400).json({ message: 'Ce code-barres est déjà utilisé' });
            }

            const produit = await ProduitModel.creer(produitData);
            res.status(201).json({
                message: 'Produit créé avec succès',
                produit
            });
        } catch (error) {
            console.error('Erreur lors de la création du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la création du produit' });
        }
    }

    static async lister(req, res) {
        try {
            const { recherche, page, limite } = req.query;
            const produits = await ProduitModel.lister(req.user.id, {
                recherche,
                page: parseInt(page) || 1,
                limite: parseInt(limite) || 10
            });

            res.json({ produits });
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
        }
    }

    static async recuperer(req, res) {
        try {
            const produit = await ProduitModel.trouverParId(req.params.id, req.user.id);
            if (!produit) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            res.json({ produit });
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
        }
    }

    static async mettreAJour(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Vérifier si le produit existe
            const produitExistant = await ProduitModel.trouverParId(req.params.id, req.user.id);
            if (!produitExistant) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            // Si le code-barres est modifié, vérifier qu'il n'existe pas déjà
            if (req.body.code_barre && req.body.code_barre !== produitExistant.code_barre) {
                const produitAvecCodeBarre = await ProduitModel.trouverParCodeBarre(req.body.code_barre, req.user.id);
                if (produitAvecCodeBarre) {
                    return res.status(400).json({ message: 'Ce code-barres est déjà utilisé' });
                }
            }

            const produit = await ProduitModel.mettreAJour(req.params.id, req.user.id, req.body);
            res.json({
                message: 'Produit mis à jour avec succès',
                produit
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
        }
    }

    static async supprimer(req, res) {
        try {
            const produit = await ProduitModel.supprimer(req.params.id, req.user.id);
            if (!produit) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            res.json({
                message: 'Produit supprimé avec succès',
                produit
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
        }
    }

    static async mettreAJourStock(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { quantite } = req.body;
            const produit = await ProduitModel.mettreAJourStock(req.params.id, req.user.id, quantite);
            
            if (!produit) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            // Vérifier si le stock est bas après la mise à jour
            if (produit.stock <= produit.stock_limite) {
                // Dans un vrai système, on pourrait envoyer une notification ici
                return res.json({
                    message: 'Stock mis à jour avec succès - ATTENTION: Stock bas',
                    produit,
                    alerte: 'Stock bas'
                });
            }

            res.json({
                message: 'Stock mis à jour avec succès',
                produit
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du stock:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du stock' });
        }
    }

    static async verifierStocksBas(req, res) {
        try {
            const produits = await ProduitModel.verifierStockBas(req.user.id);
            res.json({
                produits,
                message: produits.length > 0 ? 'Produits avec stock bas trouvés' : 'Aucun produit avec stock bas'
            });
        } catch (error) {
            console.error('Erreur lors de la vérification des stocks bas:', error);
            res.status(500).json({ message: 'Erreur lors de la vérification des stocks bas' });
        }
    }

    static async getValeursNutritionnellesParTranche(req, res) {
        try {
            const produit = await ProduitModel.getValeursNutritionnellesParTranche(req.params.id, req.user.id);
            
            if (!produit) {
                return res.status(404).json({ 
                    message: 'Produit non trouvé ou ce produit n\'est pas géré en tranches' 
                });
            }

            res.json(produit);
        } catch (error) {
            console.error('Erreur lors de la récupération des valeurs nutritionnelles par tranche:', error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des valeurs nutritionnelles par tranche' 
            });
        }
    }
}

module.exports = ProduitController; 