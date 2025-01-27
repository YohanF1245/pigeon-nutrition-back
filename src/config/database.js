const { Pool } = require('pg');
const { initDatabase } = require('./init-database');

let pool;

async function createPool() {
    if (!pool) {
        // Initialiser la base de données si nécessaire
        await initDatabase();

        // Créer le pool de connexions
        pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        pool.on('connect', () => {
            console.log('Connexion à la base de données établie');
        });

        pool.on('error', (err) => {
            console.error('Erreur de connexion à la base de données:', err);
        });
    }
    return pool;
}

module.exports = {
    query: async (text, params) => {
        const currentPool = await createPool();
        return currentPool.query(text, params);
    },
    getPool: async () => {
        return await createPool();
    }
}; 