const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const createDatabase = async () => {
    // Connexion à postgres pour créer la base de données
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres'
    });

    try {
        // Vérifier si la base de données existe
        const checkDb = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME]
        );

        // Si la base de données n'existe pas, la créer
        if (checkDb.rowCount === 0) {
            console.log(`Création de la base de données ${process.env.DB_NAME}...`);
            await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log('Base de données créée avec succès !');
        } else {
            console.log('La base de données existe déjà.');
        }
    } catch (error) {
        console.error('Erreur lors de la création de la base de données:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

const initializeTables = async () => {
    // Connexion à la nouvelle base de données
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Initialisation des tables...');
        
        // Lire le fichier SQL
        const sqlPath = path.join(__dirname, '../config/init.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Exécuter les requêtes SQL
        await pool.query(sqlContent);
        
        console.log('Tables initialisées avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des tables:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

const init = async () => {
    try {
        await createDatabase();
        await initializeTables();
        console.log('Initialisation de la base de données terminée !');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        process.exit(1);
    }
};

// Exécuter le script si appelé directement
if (require.main === module) {
    init();
}

module.exports = { init }; 