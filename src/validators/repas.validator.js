const { body } = require('express-validator');

const repasValidationRules = {
    creer: [
        body('nom')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('date')
            .isISO8601()
            .toDate()
            .withMessage('La date doit être au format YYYY-MM-DD'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('La description ne doit pas dépasser 500 caractères')
    ],

    mettreAJour: [
        body('nom')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('date')
            .optional()
            .isISO8601()
            .toDate()
            .withMessage('La date doit être au format YYYY-MM-DD'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('La description ne doit pas dépasser 500 caractères')
    ],

    ajouterProduit: [
        body('produit_id')
            .isUUID()
            .withMessage('L\'ID du produit doit être un UUID valide'),
        body('quantite')
            .isFloat({ min: 0.01 })
            .withMessage('La quantité doit être un nombre positif')
    ]
};

module.exports = repasValidationRules; 