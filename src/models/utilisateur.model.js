const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class UtilisateurModel {
    static async creer(userData) {
        const { email, mot_de_passe, nom, prenom } = userData;
        
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
        
        return prisma.utilisateur.create({
            data: {
                email,
                mot_de_passe: hashedPassword,
                nom,
                prenom
            }
        });
    }

    static async trouverParEmail(email) {
        return prisma.utilisateur.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                mot_de_passe: true,
                nom: true,
                prenom: true,
                role: true,
                date_creation: true,
                date_modification: true
            }
        });
    }

    static async trouverParId(id) {
        return prisma.utilisateur.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                date_creation: true,
                date_modification: true
            }
        });
    }

    static async mettreAJour(id, userData) {
        const { nom, prenom } = userData;
        return prisma.utilisateur.update({
            where: { id },
            data: { nom, prenom },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                date_creation: true,
                date_modification: true
            }
        });
    }

    static async changerMotDePasse(id, nouveauMotDePasse) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, salt);
        
        return prisma.utilisateur.update({
            where: { id },
            data: { mot_de_passe: hashedPassword },
            select: { id: true }
        });
    }

    static async verifierMotDePasse(motDePasseSaisi, motDePasseHash) {
        if (!motDePasseSaisi || !motDePasseHash) {
            return false;
        }
        return bcrypt.compare(motDePasseSaisi, motDePasseHash);
    }

    static async findById(id) {
        return prisma.utilisateur.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                mot_de_passe: true,
                nom: true,
                prenom: true,
                role: true,
                date_creation: true,
                date_modification: true
            }
        });
    }

    static async updatePassword(id, hashedPassword) {
        return prisma.utilisateur.update({
            where: { id },
            data: {
                mot_de_passe: hashedPassword,
                date_modification: new Date()
            }
        });
    }
}

module.exports = UtilisateurModel; 