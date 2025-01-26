const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UtilisateurModel = require('../models/utilisateur.model');

class AuthController {
    static async register(req, res) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, mot_de_passe, nom, prenom } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const utilisateurExistant = await UtilisateurModel.trouverParEmail(email);
            if (utilisateurExistant) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }

            // Créer l'utilisateur
            const utilisateur = await UtilisateurModel.creer({
                email,
                mot_de_passe,
                nom,
                prenom
            });

            // Générer le token JWT
            const token = jwt.sign(
                { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                token,
                utilisateur: {
                    id: utilisateur.id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({ message: 'Erreur lors de l\'inscription' });
        }
    }

    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, mot_de_passe } = req.body;

            // Vérifier si l'utilisateur existe
            const utilisateur = await UtilisateurModel.trouverParEmail(email);
            if (!utilisateur) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            // Vérifier le mot de passe
            const motDePasseValide = await UtilisateurModel.verifierMotDePasse(
                mot_de_passe,
                utilisateur.mot_de_passe
            );

            if (!motDePasseValide) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Connexion réussie',
                token,
                utilisateur: {
                    id: utilisateur.id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    }

    static async getProfile(req, res) {
        try {
            const utilisateur = await UtilisateurModel.trouverParId(req.user.id);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.json({
                utilisateur: {
                    id: utilisateur.id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
        }
    }

    static async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const utilisateur = await UtilisateurModel.mettreAJour(req.user.id, req.body);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.json({
                message: 'Profil mis à jour avec succès',
                utilisateur: {
                    id: utilisateur.id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
        }
    }

    static async resetPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

            // Vérifier l'ancien mot de passe
            const utilisateur = await UtilisateurModel.trouverParId(req.user.id);
            const motDePasseValide = await UtilisateurModel.verifierMotDePasse(
                ancien_mot_de_passe,
                utilisateur.mot_de_passe
            );

            if (!motDePasseValide) {
                return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
            }

            // Mettre à jour le mot de passe
            await UtilisateurModel.changerMotDePasse(req.user.id, nouveau_mot_de_passe);

            res.json({ message: 'Mot de passe mis à jour avec succès' });
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
        }
    }
}

module.exports = AuthController; 