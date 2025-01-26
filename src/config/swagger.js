const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Pigeon Nutrition',
            version: '1.0.0',
            description: 'API de gestion de valeurs nutritionnelles pour les produits alimentaires',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur de développement',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Chemins des fichiers contenant les annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs; 