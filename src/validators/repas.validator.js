const { body } = require('express-validator');

const repasValidationRules = {
    creer: [
        body('nom')
            .notEmpty()
            .withMessage('Le nom est requis')
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('date')
            .notEmpty()
            .withMessage('La date est requise')
            .isISO8601()
            .withMessage('La date doit être au format YYYY-MM-DD'),
        body('description')
            .optional()
            .isLength({ max: 500 })
            .withMessage('La description ne doit pas dépasser 500 caractères'),
        body('produits')
            .optional()
            .isArray()
            .withMessage('Les produits doivent être un tableau'),
        body('produits.*.produit_id')
            .optional()
            .isUUID()
            .withMessage('L\'ID du produit doit être un UUID valide'),
        body('produits.*.quantite')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('La quantité doit être supérieure à 0')
    ],

    mettreAJour: [
        body('nom')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('date')
            .optional()
            .isISO8601()
            .withMessage('La date doit être au format YYYY-MM-DD'),
        body('description')
            .optional()
            .isLength({ max: 500 })
            .withMessage('La description ne doit pas dépasser 500 caractères')
    ],

    ajouterProduit: [
        body('produit_id')
            .notEmpty()
            .withMessage('L\'ID du produit est requis')
            .isUUID()
            .withMessage('L\'ID du produit doit être un UUID valide'),
        body('quantite')
            .notEmpty()
            .withMessage('La quantité est requise')
            .isFloat({ min: 0.01 })
            .withMessage('La quantité doit être supérieure à 0')
    ]
};

module.exports = { repasValidationRules }; 