const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Log pour debug
        console.log('Headers:', req.headers);
        console.log('Authorization:', req.headers.authorization);

        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('Pas de header d\'autorisation');
            return res.status(401).json({ message: 'Token d\'authentification manquant' });
        }

        // Vérifier le format du token (Bearer token)
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.log('Format du token invalide:', parts);
            return res.status(401).json({ message: 'Format du token invalide' });
        }

        const token = parts[1];
        
        // Vérifier et décoder le token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token décodé:', decoded);
            
            // Ajouter les informations de l'utilisateur à la requête
            req.user = decoded;
            
            next();
        } catch (jwtError) {
            console.error('Erreur JWT:', jwtError);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expiré' });
            }
            return res.status(401).json({ message: 'Token invalide', error: jwtError.message });
        }
    } catch (error) {
        console.error('Erreur générale:', error);
        return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
    }
};

module.exports = authMiddleware; 