const express = require('express');
const router = express.Router();
const RepasController = require('../controllers/repas.controller');
const { repasValidationRules } = require('../validators/repas.validator');
const { verifierToken } = require('../middlewares/auth.middleware');

// Routes protégées par authentification
router.use(verifierToken);

// Créer un repas
router.post('/', repasValidationRules.creer, RepasController.creer);

// Lister les repas
router.get('/', RepasController.lister);

// Récupérer un repas spécifique
router.get('/:id', RepasController.recuperer);

// Mettre à jour un repas
router.put('/:id', repasValidationRules.mettreAJour, RepasController.mettreAJour);

// Supprimer un repas
router.delete('/:id', RepasController.supprimer);

// Ajouter un produit à un repas
router.post('/:id/produits', repasValidationRules.ajouterProduit, RepasController.ajouterProduit);

// Supprimer un produit d'un repas
router.delete('/:id/produits/:composition_id', RepasController.supprimerProduit);

module.exports = router; 