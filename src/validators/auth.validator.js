const { body } = require('express-validator');

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('L\'email n\'est pas valide')
        .normalizeEmail(),
    body('mot_de_passe')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('nom')
        .notEmpty()
        .withMessage('Le nom est requis')
        .trim(),
    body('prenom')
        .notEmpty()
        .withMessage('Le prénom est requis')
        .trim()
];

const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('L\'email n\'est pas valide')
        .normalizeEmail(),
    body('mot_de_passe')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
];

const updateProfileValidator = [
    body('nom')
        .notEmpty()
        .withMessage('Le nom est requis')
        .trim(),
    body('prenom')
        .notEmpty()
        .withMessage('Le prénom est requis')
        .trim()
];

const resetPasswordValidator = [
    body('ancien_mot_de_passe')
        .notEmpty()
        .withMessage('L\'ancien mot de passe est requis'),
    body('nouveau_mot_de_passe')
        .isLength({ min: 6 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
];

module.exports = {
    registerValidator,
    loginValidator,
    updateProfileValidator,
    resetPasswordValidator
}; 