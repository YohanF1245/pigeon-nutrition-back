const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth.routes');
const produitRoutes = require('./routes/produit.routes');
const repasRoutes = require('./routes/repas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const testRoutes = require('./routes/test.routes');

// Import de la configuration Swagger
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Pigeon Nutrition' });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des produits
app.use('/api/produits', produitRoutes);

// Routes des repas
app.use('/api/repas', repasRoutes);

// Routes du dashboard
app.use('/api/dashboard', dashboardRoutes);

// Routes de test (uniquement en développement)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue !',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
}); 