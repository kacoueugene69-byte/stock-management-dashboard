require('dotenv').config();
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');

console.log('\n🔧 SCRIPT DE RÉPARATION - GSTOCK UTILISATEUR\n');
console.log('='.repeat(50));

// Configuration avec votre URL exacte
const DATABASE_URL = process.env.DATABASE_URL;
console.log('📡 DATABASE_URL:', DATABASE_URL?.substring(0, 50) + '...\n');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

// FONCTION 1: Diagnostic complet
async function diagnostic() {
  try {
    console.log('🔍 ÉTAPE 1: Test de connexion à Neon...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie!\n');

    console.log('🔍 ÉTAPE 2: Vérification de la table utilisateurs...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'utilisateurs'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table "utilisateurs" non trouvée!');
      console.log('💡 Exécutez le script SQL fourni dans Neon Console\n');
      return false;
    }
    console.log('✅ Table "utilisateurs" existe\n');

    console.log('🔍 ÉTAPE 3: Liste de tous les utilisateurs...');
    const [users] = await sequelize.query(
      'SELECT id, email, role, statut, created_at, LENGTH(mot_de_passe) as hash_length, SUBSTRING(mot_de_passe, 1, 10) as hash_prefix FROM utilisateurs ORDER BY id'
    );

    if (users.length === 0) {
      console.log('⚠️  Aucun utilisateur dans la base\n');
      return false;
    }

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s):\n`);
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   - ID: ${u.id}`);
      console.log(`   - Rôle: ${u.role}`);
      console.log(`   - Statut: ${u.statut}`);
      console.log(`   - Hash: ${u.hash_prefix}... (${u.hash_length} caractères)`);
      
      // Vérifier le format du hash
      if (!u.hash_prefix.startsWith('$2b$') && !u.hash_prefix.startsWith('$2a$')) {
        console.log(`   ⚠️  PROBLÈME: Hash invalide! Ne commence pas par $2b$ ou $2a$`);
      } else {
        console.log(`   ✅ Hash bcrypt valide`);
      }
      console.log('');
    });

    return true;
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    return false;
  }
}

// FONCTION 2: Créer un utilisateur de test
async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion réussie\n');

    const email = 'test@cdcom-faci.com';
    const password = 'Test123456!';

    console.log('🔧 Création d\'un utilisateur de test...');
    console.log('   Email:', email);
    console.log('   Mot de passe:', password);
    console.log('');

    // Supprimer s'il existe déjà
    await sequelize.query(
      'DELETE FROM utilisateurs WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email: email.toLowerCase() } }
    );

    // Hacher le mot de passe
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    console.log(`🔐 Hachage avec bcrypt (${rounds} rounds)...`);
    const hash = await bcrypt.hash(password, rounds);
    console.log(`✅ Hash généré: ${hash.substring(0, 30)}...\n`);

    // Insérer
    await sequelize.query(
      `INSERT INTO utilisateurs (email, mot_de_passe, role, statut, created_at)
       VALUES (:email, :hash, 'vendeur', 'actif', NOW())`,
      { replacements: { email: email.toLowerCase(), hash } }
    );

    console.log('✅ Utilisateur créé avec succès!\n');
    console.log('📋 IDENTIFIANTS DE CONNEXION:');
    console.log('   📧 Email:', email);
    console.log('   🔑 Mot de passe:', password);
    console.log('\n🎯 Essayez de vous connecter avec ces identifiants!\n');

    // Vérifier immédiatement
    console.log('🔍 Vérification immédiate...');
    const [result] = await sequelize.query(
      'SELECT email, mot_de_passe FROM utilisateurs WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email: email.toLowerCase() } }
    );

    if (result.length > 0) {
      const stored = result[0];
      console.log('✅ Utilisateur trouvé en base');
      console.log('   Hash stocké:', stored.mot_de_passe.substring(0, 30) + '...');
      
      // Tester le mot de passe
      const isValid = await bcrypt.compare(password, stored.mot_de_passe);
      console.log('   Test bcrypt:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
    }
    console.log('');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

// FONCTION 3: Réinitialiser un utilisateur existant
async function resetUser(email, newPassword) {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion réussie\n');

    email = email.trim().toLowerCase();
    console.log(`🔄 Réinitialisation pour: ${email}\n`);

    // Vérifier si existe
    const [existing] = await sequelize.query(
      'SELECT id, email FROM utilisateurs WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email } }
    );

    if (existing.length === 0) {
      console.log(`❌ Utilisateur ${email} non trouvé\n`);
      return;
    }

    console.log('✅ Utilisateur trouvé:', existing[0].email);

    // Hacher le nouveau mot de passe
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    console.log(`🔐 Hachage du nouveau mot de passe (${rounds} rounds)...`);
    const hash = await bcrypt.hash(newPassword, rounds);
    console.log(`✅ Nouveau hash: ${hash.substring(0, 30)}...\n`);

    // Mettre à jour
    await sequelize.query(
      'UPDATE utilisateurs SET mot_de_passe = :hash WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email, hash } }
    );

    console.log('✅ Mot de passe réinitialisé avec succès!\n');
    console.log('📋 NOUVEAUX IDENTIFIANTS:');
    console.log('   📧 Email:', email);
    console.log('   🔑 Mot de passe:', newPassword);
    console.log('\n🎯 Essayez de vous connecter maintenant!\n');

    // Vérifier
    console.log('🔍 Vérification...');
    const [result] = await sequelize.query(
      'SELECT mot_de_passe FROM utilisateurs WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email } }
    );

    if (result.length > 0) {
      const isValid = await bcrypt.compare(newPassword, result[0].mot_de_passe);
      console.log('   Test bcrypt:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
    }
    console.log('');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

// FONCTION 4: Tester un mot de passe existant
async function testPassword(email, password) {
  try {
    await sequelize.authenticate();

    email = email.trim().toLowerCase();
    console.log(`🔍 Test de connexion pour: ${email}\n`);

    const [result] = await sequelize.query(
      'SELECT id, email, mot_de_passe, role, statut FROM utilisateurs WHERE LOWER(email) = LOWER(:email)',
      { replacements: { email } }
    );

    if (result.length === 0) {
      console.log('❌ Utilisateur non trouvé\n');
      return false;
    }

    const user = result[0];
    console.log('✅ Utilisateur trouvé:');
    console.log('   - Email:', user.email);
    console.log('   - Rôle:', user.role);
    console.log('   - Statut:', user.statut);
    console.log('   - Hash:', user.mot_de_passe.substring(0, 30) + '...');
    console.log('');

    console.log('🔐 Test du mot de passe...');
    const isValid = await bcrypt.compare(password, user.mot_de_passe);
    
    if (isValid) {
      console.log('✅ LE MOT DE PASSE EST CORRECT! 🎉\n');
      return true;
    } else {
      console.log('❌ LE MOT DE PASSE EST INCORRECT\n');
      console.log('💡 Solutions:');
      console.log('   1. Vérifiez le mot de passe');
      console.log('   2. Réinitialisez avec: node fix-user.js --reset email@example.com NouveauMDP123!');
      console.log('');
      return false;
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    return false;
  }
}

// EXÉCUTION
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args[0] === '--create') {
      await createTestUser();
    } else if (args[0] === '--reset' && args[1] && args[2]) {
      await resetUser(args[1], args[2]);
    } else if (args[0] === '--test' && args[1] && args[2]) {
      await testPassword(args[1], args[2]);
    } else if (args[0] === '--help') {
      console.log('\n📖 UTILISATION:\n');
      console.log('  Diagnostic:');
      console.log('    node fix-user.js\n');
      console.log('  Créer un utilisateur de test:');
      console.log('    node fix-user.js --create\n');
      console.log('  Réinitialiser un utilisateur:');
      console.log('    node fix-user.js --reset email@example.com NouveauMDP123!\n');
      console.log('  Tester un mot de passe:');
      console.log('    node fix-user.js --test email@example.com MotDePasse123!\n');
    } else {
      await diagnostic();
      console.log('\n💡 COMMANDES DISPONIBLES:');
      console.log('   node fix-user.js --create                                  # Créer test@cdcom-faci.com');
      console.log('   node fix-user.js --reset email@example.com NouveauMDP     # Réinitialiser');
      console.log('   node fix-user.js --test email@example.com MotDePasse      # Tester');
      console.log('   node fix-user.js --help                                    # Aide\n');
    }
  } catch (err) {
    console.error('❌ Erreur fatale:', err);
  } finally {
    await sequelize.close();
  }
}

main();