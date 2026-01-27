// diagnostic-auth.js - Script de diagnostic complet
const bcrypt = require('bcrypt');
const { Utilisateur } = require('./models');

async function diagnosticComplet(email) {
  console.log('\n🔍 DIAGNOSTIC COMPLET AUTHENTIFICATION');
  console.log('═'.repeat(60));
  console.log(`📧 Email recherché: ${email}\n`);

  try {
    // 1. Recherche de l'utilisateur
    console.log('1️⃣ RECHERCHE UTILISATEUR');
    console.log('─'.repeat(60));
    
    const user = await Utilisateur.findOne({ 
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log('❌ UTILISATEUR NON TROUVÉ');
      console.log('\n📋 Liste des utilisateurs en base:');
      const allUsers = await Utilisateur.findAll({
        attributes: ['id', 'email', 'role', 'statut', 'created_at']
      });
      console.table(allUsers.map(u => u.toJSON()));
      return;
    }

    console.log('✅ Utilisateur trouvé!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Statut: ${user.statut}`);
    console.log(`   Créé le: ${user.created_at}`);

    // 2. Analyse du hash
    console.log('\n2️⃣ ANALYSE DU HASH');
    console.log('─'.repeat(60));
    
    const hash = user.mot_de_passe;
    console.log(`   Hash complet: ${hash.substring(0, 30)}...`);
    console.log(`   Longueur: ${hash.length} caractères`);
    console.log(`   Début: ${hash.substring(0, 4)}`);
    
    const isBcrypt = hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$');
    console.log(`   Format bcrypt: ${isBcrypt ? '✅ OUI' : '❌ NON'}`);
    
    if (isBcrypt) {
      const parts = hash.split('$');
      console.log(`   Version: ${parts[1]}`);
      console.log(`   Rounds: ${parts[2]}`);
      console.log(`   Salt: ${parts[3]?.substring(0, 10)}...`);
    } else {
      console.log('   ⚠️  PROBLÈME: Le hash n\'est pas au format bcrypt!');
      console.log('   ⚠️  Cela signifie que le mot de passe n\'a pas été haché correctement.');
    }

    // 3. Test de plusieurs mots de passe
    console.log('\n3️⃣ TEST DE MOTS DE PASSE');
    console.log('─'.repeat(60));
    
    const testPasswords = [
      'test1234',
      'password',
      '123456',
      email.split('@')[0], // Utiliser la partie avant @ de l'email
    ];

    for (const pwd of testPasswords) {
      try {
        const match = await bcrypt.compare(pwd, hash);
        console.log(`   "${pwd}": ${match ? '✅ MATCH!' : '❌ Pas de match'}`);
        if (match) {
          console.log(`\n🎉 MOT DE PASSE TROUVÉ: "${pwd}"`);
        }
      } catch (err) {
        console.log(`   "${pwd}": ❌ Erreur - ${err.message}`);
      }
    }

    // 4. Générer un nouveau hash pour comparaison
    console.log('\n4️⃣ GÉNÉRATION HASH TEST');
    console.log('─'.repeat(60));
    
    const testPassword = 'test1234';
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log(`   Mot de passe test: "${testPassword}"`);
    console.log(`   Nouveau hash: ${newHash.substring(0, 30)}...`);
    console.log(`   Longueur: ${newHash.length} caractères`);
    
    const testMatch = await bcrypt.compare(testPassword, newHash);
    console.log(`   Vérification: ${testMatch ? '✅ OK' : '❌ ERREUR'}`);

    // 5. Comparaison des hashes
    console.log('\n5️⃣ COMPARAISON HASHES');
    console.log('─'.repeat(60));
    console.log(`   Hash en base (début): ${hash.substring(0, 20)}`);
    console.log(`   Hash test (début):    ${newHash.substring(0, 20)}`);
    console.log(`   Longueurs identiques: ${hash.length === newHash.length ? '✅' : '❌'}`);
    console.log(`   Formats identiques: ${hash.substring(0, 4) === newHash.substring(0, 4) ? '✅' : '❌'}`);

    // 6. Vérifier si double hachage
    console.log('\n6️⃣ DÉTECTION DOUBLE HACHAGE');
    console.log('─'.repeat(60));
    
    // Si le hash est très long ou ne correspond pas au format bcrypt standard
    if (hash.length > 100) {
      console.log('   ⚠️  ALERTE: Hash anormalement long (> 100 caractères)');
      console.log('   ⚠️  Possible double hachage détecté!');
    } else if (!isBcrypt) {
      console.log('   ⚠️  ALERTE: Hash ne commence pas par $2b$, $2a$ ou $2y$');
      console.log('   ⚠️  Le mot de passe n\'a pas été haché avec bcrypt!');
    } else {
      console.log('   ✅ Format du hash correct');
    }

    // 7. Recommandations
    console.log('\n7️⃣ RECOMMANDATIONS');
    console.log('─'.repeat(60));
    
    if (!isBcrypt) {
      console.log('   🔧 SOLUTION 1: Réinitialiser le mot de passe de cet utilisateur');
      console.log('   🔧 SOLUTION 2: Supprimer et recréer le compte');
      console.log('   🔧 SOLUTION 3: Exécuter le script de correction SQL');
    } else {
      console.log('   ℹ️  Le hash semble correct. Le problème est ailleurs:');
      console.log('   • Vérifiez que le mot de passe saisi est correct');
      console.log('   • Vérifiez les espaces avant/après le mot de passe');
      console.log('   • Vérifiez la casse (majuscules/minuscules)');
    }

    // 8. Générer SQL de correction
    console.log('\n8️⃣ SCRIPT SQL DE CORRECTION');
    console.log('─'.repeat(60));
    
    const correctionHash = await bcrypt.hash('test1234', 12);
    console.log('   -- Réinitialiser avec mot de passe: test1234');
    console.log(`   UPDATE utilisateurs`);
    console.log(`   SET mot_de_passe = '${correctionHash}'`);
    console.log(`   WHERE email = '${email}';`);

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error);
    console.error(error.stack);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('FIN DU DIAGNOSTIC\n');
}

// Exécution
const email = process.argv[2];

if (!email) {
  console.log('Usage: node diagnostic-auth.js <email>');
  console.log('Exemple: node diagnostic-auth.js kacou@gmail.com');
  process.exit(1);
}

diagnosticComplet(email)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });