require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // index.js qui configure Sequelize

const app = express();

// Configuration CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ============================================
// TEST CONNEXION BASE
// ============================================
sequelize.authenticate()
  .then(() => console.log('✅ Connecté à PostgreSQL via Sequelize'))
  .catch(err => console.error('❌ Erreur connexion DB:', err));

// ============================================
// IMPORT ROUTES
// ============================================
const utilisateursRoutes = require('./routes/utilisateurs');
app.use('/api/users', utilisateursRoutes);
const articlesRoutes = require('./routes/articles');
const clientsRoutes = require('./routes/clients');
const personnelsRoutes = require('./routes/personnels');
const ventesRoutes = require('./routes/ventes');
const commandesRoutes = require('./routes/commandes');
const facturesRoutes = require('./routes/factures');
const magasinsRoutes = require('./routes/magasins');
const categoriesRoutes = require('./routes/categories');
const mouvementsStockRoutes = require('./routes/mouvementsStock');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


// ============================================
// UTILISATION DES ROUTES
// ============================================
app.use('/api/articles', articlesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/staff', personnelsRoutes);
app.use('/api/users', utilisateursRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/magasins', magasinsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/mouvements-stock', mouvementsStockRoutes);

// ============================================
// ROUTE DE TEST
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API GStock fonctionnelle', timestamp: new Date().toISOString() });
});

// ============================================
// DÉMARRAGE SERVEUR
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  await sequelize.sync({ alter: false, force: false });
  console.log(`✅ Models synchronisés avec la base`);
});
