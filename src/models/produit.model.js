const db = require('../config/database');
const bcrypt = require('bcrypt');

class ProduitModel {
    static async creer(produitData) {
        const { 
            utilisateur_id, nom, code_barre, calories, 
            matieres_grasses, glucides, proteines, sel,
            stock, unite_stock, prix_unitaire, stock_limite,
            poids_par_tranche 
        } = produitData;

        const query = `
            INSERT INTO produits (
                utilisateur_id, nom, code_barre, calories, 
                matieres_grasses, glucides, proteines, sel,
                stock, unite_stock, prix_unitaire, stock_limite,
                poids_par_tranche
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            utilisateur_id, nom, code_barre, calories,
            matieres_grasses, glucides, proteines, sel,
            stock, unite_stock, prix_unitaire, stock_limite,
            unite_stock === 'TRANCHE' ? poids_par_tranche : null
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async trouverParId(id, utilisateur_id) {
        const query = 'SELECT * FROM produits WHERE id = $1 AND utilisateur_id = $2';
        const { rows } = await db.query(query, [id, utilisateur_id]);
        return rows[0];
    }

    static async trouverParCodeBarre(code_barre, utilisateur_id) {
        const query = 'SELECT * FROM produits WHERE code_barre = $1 AND utilisateur_id = $2';
        const { rows } = await db.query(query, [code_barre, utilisateur_id]);
        return rows[0];
    }

    static async lister(utilisateur_id, options = {}) {
        const { recherche, limite = 10, page = 1 } = options;
        const offset = (page - 1) * limite;
        
        let query = 'SELECT * FROM produits WHERE utilisateur_id = $1';
        const values = [utilisateur_id];
        
        if (recherche) {
            query += ' AND (nom ILIKE $2 OR code_barre ILIKE $2)';
            values.push(`%${recherche}%`);
        }
        
        query += ' ORDER BY date_creation DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limite, offset);

        const { rows } = await db.query(query, values);
        return rows;
    }

    static async mettreAJour(id, utilisateur_id, produitData) {
        const allowedFields = [
            'nom', 'code_barre', 'calories', 'matieres_grasses',
            'glucides', 'proteines', 'sel', 'stock',
            'unite_stock', 'prix_unitaire', 'stock_limite', 'poids_par_tranche'
        ];

        const updates = [];
        const values = [id, utilisateur_id];
        let paramCount = 3;

        if (produitData.unite_stock === 'TRANCHE' && !produitData.poids_par_tranche) {
            throw new Error('Le poids par tranche est requis pour les produits en tranches');
        }

        if (produitData.unite_stock && produitData.unite_stock !== 'TRANCHE') {
            produitData.poids_par_tranche = null;
        }

        for (const [key, value] of Object.entries(produitData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updates.length === 0) return null;

        const query = `
            UPDATE produits 
            SET ${updates.join(', ')} 
            WHERE id = $1 AND utilisateur_id = $2
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async supprimer(id, utilisateur_id) {
        const query = 'DELETE FROM produits WHERE id = $1 AND utilisateur_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, utilisateur_id]);
        return rows[0];
    }

    static async verifierStockBas(utilisateur_id) {
        const query = `
            SELECT 
                id, nom, stock, stock_limite, unite_stock, poids_par_tranche,
                CASE 
                    WHEN unite_stock = 'TRANCHE' THEN stock || ' tranches'
                    WHEN unite_stock = 'POURCENTAGE' THEN stock || '%'
                    ELSE stock || ' unités'
                END as stock_formatte
            FROM produits 
            WHERE utilisateur_id = $1 
            AND stock <= stock_limite
        `;
        const { rows } = await db.query(query, [utilisateur_id]);
        return rows;
    }

    static async mettreAJourStock(id, utilisateur_id, quantite) {
        const query = `
            UPDATE produits 
            SET stock = stock + $3
            WHERE id = $1 AND utilisateur_id = $2
            RETURNING *
        `;
        const { rows } = await db.query(query, [id, utilisateur_id, quantite]);
        return rows[0];
    }

    static async getValeursNutritionnellesParTranche(id, utilisateur_id) {
        const query = `
            SELECT 
                nom,
                poids_par_tranche,
                (calories * poids_par_tranche / 100) as calories_par_tranche,
                (matieres_grasses * poids_par_tranche / 100) as matieres_grasses_par_tranche,
                (glucides * poids_par_tranche / 100) as glucides_par_tranche,
                (proteines * poids_par_tranche / 100) as proteines_par_tranche,
                (sel * poids_par_tranche / 100) as sel_par_tranche
            FROM produits 
            WHERE id = $1 
            AND utilisateur_id = $2 
            AND unite_stock = 'TRANCHE'
        `;
        const { rows } = await db.query(query, [id, utilisateur_id]);
        return rows[0];
    }
}

module.exports = ProduitModel; 