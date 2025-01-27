const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const produitsRoutes = require('./produits.routes');
const repasRoutes = require('./repas.routes');

router.use('/auth', authRoutes);
router.use('/produits', produitsRoutes);
router.use('/repas', repasRoutes);

module.exports = router; 