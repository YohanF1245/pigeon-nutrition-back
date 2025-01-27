const db = require('../config/database');

class RepasModel {
    static async creer(repasData) {
        const { utilisateur_id, nom, date, description } = repasData;

        const query = `
            INSERT INTO repas (utilisateur_id, nom, date, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const { rows } = await db.query(query, [utilisateur_id, nom, date, description]);
        return rows[0];
    }

    static async ajouterProduit(repas_id, produit_id, quantite) {
        const query = `
            INSERT INTO composition_repas (repas_id, produit_id, quantite)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const { rows } = await db.query(query, [repas_id, produit_id, quantite]);
        return rows[0];
    }

    static async trouverParId(id, utilisateur_id) {
        const query = `
            SELECT r.*, 
                   json_agg(json_build_object(
                       'id', cr.id,
                       'produit_id', p.id,
                       'nom_produit', p.nom,
                       'quantite', cr.quantite,
                       'unite_stock', p.unite_stock,
                       'poids_par_tranche', p.poids_par_tranche
                   )) as produits
            FROM repas r
            LEFT JOIN composition_repas cr ON r.id = cr.repas_id
            LEFT JOIN produits p ON cr.produit_id = p.id
            WHERE r.id = $1 AND r.utilisateur_id = $2
            GROUP BY r.id
        `;
        const { rows } = await db.query(query, [id, utilisateur_id]);
        return rows[0];
    }

    static async lister(utilisateur_id, options = {}) {
        const { date, limite = 10, page = 1 } = options;
        const offset = (page - 1) * limite;
        
        let query = `
            SELECT r.*, 
                   json_agg(json_build_object(
                       'id', cr.id,
                       'produit_id', p.id,
                       'nom_produit', p.nom,
                       'quantite', cr.quantite,
                       'unite_stock', p.unite_stock,
                       'poids_par_tranche', p.poids_par_tranche
                   )) as produits
            FROM repas r
            LEFT JOIN composition_repas cr ON r.id = cr.repas_id
            LEFT JOIN produits p ON cr.produit_id = p.id
            WHERE r.utilisateur_id = $1
        `;
        const values = [utilisateur_id];
        
        if (date) {
            query += ' AND r.date = $2';
            values.push(date);
        }
        
        query += ' GROUP BY r.id ORDER BY r.date DESC, r.date_creation DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limite, offset);

        const { rows } = await db.query(query, values);
        return rows;
    }

    static async mettreAJour(id, utilisateur_id, repasData) {
        const allowedFields = ['nom', 'date', 'description'];
        const updates = [];
        const values = [id, utilisateur_id];
        let paramCount = 3;

        for (const [key, value] of Object.entries(repasData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updates.length === 0) return null;

        const query = `
            UPDATE repas 
            SET ${updates.join(', ')} 
            WHERE id = $1 AND utilisateur_id = $2
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async supprimer(id, utilisateur_id) {
        const query = 'DELETE FROM repas WHERE id = $1 AND utilisateur_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, utilisateur_id]);
        return rows[0];
    }

    static async supprimerProduit(repas_id, composition_id, utilisateur_id) {
        const query = `
            DELETE FROM composition_repas 
            WHERE id = $1 AND repas_id = $2 
            AND repas_id IN (SELECT id FROM repas WHERE utilisateur_id = $3)
            RETURNING *
        `;
        const { rows } = await db.query(query, [composition_id, repas_id, utilisateur_id]);
        return rows[0];
    }

    static async calculerNutriments(repas_id, utilisateur_id) {
        const query = `
            WITH produit_repas AS (
                SELECT 
                    p.*,
                    cr.quantite,
                    CASE 
                        WHEN p.unite_stock = 'TRANCHE' THEN 
                            cr.quantite * p.poids_par_tranche
                        ELSE 
                            cr.quantite
                    END as quantite_grammes
                FROM composition_repas cr
                JOIN produits p ON cr.produit_id = p.id
                WHERE cr.repas_id = $1
                AND p.utilisateur_id = $2
            )
            SELECT 
                SUM((calories * quantite_grammes) / 100) as calories_total,
                SUM((matieres_grasses * quantite_grammes) / 100) as matieres_grasses_total,
                SUM((glucides * quantite_grammes) / 100) as glucides_total,
                SUM((proteines * quantite_grammes) / 100) as proteines_total,
                SUM((sel * quantite_grammes) / 100) as sel_total
            FROM produit_repas
        `;

        const { rows } = await db.query(query, [repas_id, utilisateur_id]);
        return rows[0];
    }
}

module.exports = RepasModel; 