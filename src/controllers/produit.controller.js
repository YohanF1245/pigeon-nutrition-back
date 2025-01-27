const { validationResult } = require('express-validator');
const ProduitModel = require('../models/produit.model');

class ProduitController {
    static async creer(req, res) {
        try {
            const produitData = {
                nom: req.body.nom,
                code_barre: req.body.code_barre,
                calories: parseFloat(req.body.calories),
                matieres_grasses: parseFloat(req.body.matieres_grasses),
                glucides: parseFloat(req.body.glucides),
                proteines: parseFloat(req.body.proteines),
                sel: parseFloat(req.body.sel),
                stock: parseFloat(req.body.stock),
                prix_unitaire: parseFloat(req.body.prix_unitaire),
                stock_limite: parseFloat(req.body.stock_limite || req.body.limite_stock),
                unite_stock: req.body.unite_stock || 'UNITE',
                utilisateur_id: req.user.id
            };

            const produitExistant = await ProduitModel.trouverParCodeBarre(produitData.code_barre);
            if (produitExistant) {
                return res.status(400).json({ message: 'Un produit avec ce code barre existe déjà' });
            }

            const produit = await ProduitModel.creer(produitData);
            res.status(201).json(produit);
        } catch (error) {
            console.error('Erreur lors de la création du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la création du produit' });
        }
    }

    static async lister(req, res) {
        try {
            const produits = await ProduitModel.lister(req.user.id);
            res.json(produits);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
        }
    }

    static async recuperer(req, res) {
        try {
            const produit = await ProduitModel.trouverParId(req.params.id);
            if (!produit || produit.utilisateur.id !== req.user.id) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }
            res.json(produit);
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
        }
    }

    static async mettreAJour(req, res) {
        try {
            const produitExistant = await ProduitModel.trouverParId(req.params.id);
            if (!produitExistant || produitExistant.utilisateur.id !== req.user.id) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            const produitData = {
                nom: req.body.nom,
                code_barre: req.body.code_barre,
                calories: parseFloat(req.body.calories),
                matieres_grasses: parseFloat(req.body.matieres_grasses),
                glucides: parseFloat(req.body.glucides),
                proteines: parseFloat(req.body.proteines),
                sel: parseFloat(req.body.sel),
                stock: parseFloat(req.body.stock),
                prix_unitaire: parseFloat(req.body.prix_unitaire),
                stock_limite: parseFloat(req.body.stock_limite || req.body.limite_stock),
                unite_stock: req.body.unite_stock || 'UNITE'
            };

            const produit = await ProduitModel.mettreAJour(req.params.id, produitData);
            res.json(produit);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
        }
    }

    static async supprimer(req, res) {
        try {
            const produitExistant = await ProduitModel.trouverParId(req.params.id);
            if (!produitExistant || produitExistant.utilisateur.id !== req.user.id) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            const produit = await ProduitModel.supprimer(req.params.id);
            res.json({ message: 'Produit supprimé avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
        }
    }

    static async mettreAJourStock(req, res) {
        try {
            const produitExistant = await ProduitModel.trouverParId(req.params.id);
            if (!produitExistant || produitExistant.utilisateur.id !== req.user.id) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            const { quantite } = req.body;
            const produit = await ProduitModel.mettreAJourStock(req.params.id, parseFloat(quantite));
            res.json(produit);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du stock:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du stock' });
        }
    }

    static async verifierStocksBas(req, res) {
        try {
            const produits = await ProduitModel.verifierStocksBas(req.user.id);
            res.json(produits);
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