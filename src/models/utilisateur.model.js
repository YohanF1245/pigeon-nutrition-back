const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UtilisateurModel {
    static async creer(userData) {
        const { email, mot_de_passe, nom, prenom } = userData;
        
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
        
        const query = `
            INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, nom, prenom, role, date_creation
        `;
        
        const result = await db.query(query, [email, hashedPassword, nom, prenom]);
        return result.rows[0];
    }

    static async trouverParEmail(email) {
        const query = 'SELECT * FROM utilisateurs WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async trouverParId(id) {
        const query = 'SELECT id, email, nom, prenom, role, date_creation FROM utilisateurs WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async mettreAJour(id, userData) {
        const { nom, prenom } = userData;
        const query = `
            UPDATE utilisateurs
            SET nom = $1, prenom = $2
            WHERE id = $3
            RETURNING id, email, nom, prenom, role, date_creation
        `;
        const result = await db.query(query, [nom, prenom, id]);
        return result.rows[0];
    }

    static async changerMotDePasse(id, nouveauMotDePasse) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, salt);
        
        const query = `
            UPDATE utilisateurs
            SET mot_de_passe = $1
            WHERE id = $2
            RETURNING id
        `;
        const result = await db.query(query, [hashedPassword, id]);
        return result.rows[0];
    }

    static async verifierMotDePasse(motDePasseSaisi, motDePasseHash) {
        return await bcrypt.compare(motDePasseSaisi, motDePasseHash);
    }
}

module.exports = UtilisateurModel; 