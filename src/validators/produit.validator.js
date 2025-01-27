const { body } = require('express-validator');

const produitValidationRules = {
    creer: [
        body('nom')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('code_barre')
            .trim()
            .isLength({ min: 8, max: 13 })
            .withMessage('Le code-barres doit contenir entre 8 et 13 caractères')
            .matches(/^[0-9]+$/)
            .withMessage('Le code-barres ne doit contenir que des chiffres'),
        body('calories')
            .isFloat({ min: 0 })
            .withMessage('Les calories doivent être un nombre positif'),
        body('matieres_grasses')
            .isFloat({ min: 0 })
            .withMessage('Les matières grasses doivent être un nombre positif'),
        body('glucides')
            .isFloat({ min: 0 })
            .withMessage('Les glucides doivent être un nombre positif'),
        body('proteines')
            .isFloat({ min: 0 })
            .withMessage('Les protéines doivent être un nombre positif'),
        body('sel')
            .isFloat({ min: 0 })
            .withMessage('Le sel doit être un nombre positif'),
        body('stock')
            .isFloat({ min: 0 })
            .withMessage('Le stock doit être un nombre positif'),
        body('unite_stock')
            .isIn(['UNITE', 'POURCENTAGE', 'TRANCHE'])
            .withMessage('L\'unité de stock doit être UNITE, POURCENTAGE ou TRANCHE'),
        body('prix_unitaire')
            .isFloat({ min: 0 })
            .withMessage('Le prix unitaire doit être un nombre positif'),
        body('stock_limite')
            .isFloat({ min: 0 })
            .withMessage('La limite de stock doit être un nombre positif'),
        body('poids_par_tranche')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Le poids par tranche doit être un nombre positif')
            .custom((value, { req }) => {
                if (req.body.unite_stock === 'TRANCHE' && !value) {
                    throw new Error('Le poids par tranche est requis pour les produits en tranches');
                }
                if (req.body.unite_stock !== 'TRANCHE' && value) {
                    throw new Error('Le poids par tranche ne doit être défini que pour les produits en tranches');
                }
                return true;
            })
    ],

    mettreAJour: [
        body('nom')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('code_barre')
            .optional()
            .trim()
            .isLength({ min: 8, max: 13 })
            .withMessage('Le code-barres doit contenir entre 8 et 13 caractères')
            .matches(/^[0-9]+$/)
            .withMessage('Le code-barres ne doit contenir que des chiffres'),
        body('calories')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Les calories doivent être un nombre positif'),
        body('matieres_grasses')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Les matières grasses doivent être un nombre positif'),
        body('glucides')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Les glucides doivent être un nombre positif'),
        body('proteines')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Les protéines doivent être un nombre positif'),
        body('sel')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Le sel doit être un nombre positif'),
        body('stock')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Le stock doit être un nombre positif'),
        body('unite_stock')
            .optional()
            .isIn(['UNITE', 'POURCENTAGE', 'TRANCHE'])
            .withMessage('L\'unité de stock doit être UNITE, POURCENTAGE ou TRANCHE'),
        body('prix_unitaire')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Le prix unitaire doit être un nombre positif'),
        body('stock_limite')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('La limite de stock doit être un nombre positif'),
        body('poids_par_tranche')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Le poids par tranche doit être un nombre positif')
            .custom((value, { req }) => {
                if (req.body.unite_stock === 'TRANCHE' && !value) {
                    throw new Error('Le poids par tranche est requis pour les produits en tranches');
                }
                if (req.body.unite_stock !== 'TRANCHE' && value) {
                    throw new Error('Le poids par tranche ne doit être défini que pour les produits en tranches');
                }
                return true;
            })
    ],

    mettreAJourStock: [
        body('quantite')
            .isFloat()
            .withMessage('La quantité doit être un nombre')
    ]
};

module.exports = produitValidationRules; 