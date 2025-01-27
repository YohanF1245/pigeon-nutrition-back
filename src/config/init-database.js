const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    // Connexion initiale à PostgreSQL
    const initPool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: 'postgres',  // Utilisateur par défaut pour la création
        password: process.env.POSTGRES_PASSWORD,  // Mot de passe root PostgreSQL
        database: 'postgres'  // Base de données par défaut
    });

    try {
        // Lire le script SQL
        const sqlScript = fs.readFileSync(
            path.join(__dirname, 'init-db.sql'),
            'utf8'
        );

        // Remplacer les variables dans le script
        const configuredScript = sqlScript
            .replace(/\${DB_USER}/g, process.env.DB_USER)
            .replace(/\${DB_PASSWORD}/g, process.env.DB_PASSWORD)
            .replace(/\${DB_NAME}/g, process.env.DB_NAME);

        // Exécuter le script
        await initPool.query(configuredScript);
        console.log('Base de données initialisée avec succès');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    } finally {
        await initPool.end();
    }
}

// Exporter la fonction d'initialisation
module.exports = { initDatabase }; 