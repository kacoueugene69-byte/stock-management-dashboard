// server.js

console.log('SUPERADMIN_SECRET=', process.env.SUPERADMIN_SECRET);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // index.js qui exporte sequelize et modèles

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Import routes
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

app.use('/api/auth', authRoutes);
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API GStock fonctionnelle', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  try {
    // ⚠️ En production, on ne modifie pas la structure des tables
    await sequelize.authenticate();
    console.log('✅ Connexion à la base réussie');
  } catch (err) {
    console.error('❌ Erreur de connexion Sequelize:', err);
  }
});
