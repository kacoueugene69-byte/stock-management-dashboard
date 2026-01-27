require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const app = express();

// Sécurité
app.use(helmet());

// CORS - autoriser votre frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parsing JSON
app.use(express.json());

// Rate limiting pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// Import des routes
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const articlesRoutes = require('./routes/articles');
const clientsRoutes = require('./routes/clients');
const personnelsRoutes = require('./routes/personnels');
const ventesRoutes = require('./routes/ventes');
const commandesRoutes = require('./routes/commandes');
const facturesRoutes = require('./routes/factures');
const magasinsRoutes = require('./routes/magasins');
const categoriesRoutes = require('./routes/categories');
const mouvementsStockRoutes = require('./routes/mouvementsStock');
const meRoutes = require('./routes/me');

// Montage des routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', utilisateursRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/staff', personnelsRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/magasins', magasinsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/mouvements-stock', mouvementsStockRoutes);
app.use('/api/me', meRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API GStock fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gstock-backend',
    time: new Date().toISOString()
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données PostgreSQL réussie');
    
    // Synchroniser les modèles (en développement uniquement)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Modèles synchronisés');
    }
  } catch (err) {
    console.error('❌ Erreur de connexion Sequelize:', err);
  }
});

module.exports = app;