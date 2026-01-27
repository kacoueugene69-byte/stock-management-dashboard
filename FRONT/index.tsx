// // index.tsx - CORRIGÉ AVEC VÉRIFICATION AUTH
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css'; // Si vous avez un fichier CSS global
// import { loadAuthTokenFromStorage } from './services/api';
// import { setAuthToken } from './services/api';



// const rootElement = document.getElementById('root');
// if (!rootElement) {
//   throw new Error("Could not find root element to mount to");
// }

// // 🔧 VÉRIFICATION ET NETTOYAGE DE L'AUTH AU DÉMARRAGE
// function initializeAuthState() {
//   console.log('🚀 Initialisation de l\'application...');
  
//   // Vérifier les données d'authentification stockées
//   const token = localStorage.getItem('gstock_token') || localStorage.getItem('auth_token');
//   const userStr = localStorage.getItem('user');
  
//   console.log('🔍 État d\'authentification initial:');
//   console.log('   Token présent:', !!token);
//   console.log('   Utilisateur présent:', !!userStr);
  
//   // Nettoyer les données incohérentes
//   if (token && !userStr) {
//     console.warn('⚠️ Token sans utilisateur - Nettoyage...');
//     localStorage.removeItem('gstock_token');
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('isAuthenticated');
//   }
  
//   if (userStr && !token) {
//     console.warn('⚠️ Utilisateur sans token - Nettoyage...');
//     localStorage.removeItem('user');
//     localStorage.removeItem('isAuthenticated');
//   }
  
//   // Valider le format du user JSON
//   if (userStr) {
//     try {
//       const user = JSON.parse(userStr);
//       if (!user.id || !user.email) {
//         console.warn('⚠️ Format utilisateur invalide - Nettoyage...');
//         localStorage.removeItem('user');
//         localStorage.removeItem('isAuthenticated');
//       } else {
//         console.log('✅ Utilisateur valide:', user.email);
//       }
//     } catch (e) {
//       console.error('❌ Erreur parsing user - Nettoyage...', e);
//       localStorage.removeItem('user');
//       localStorage.removeItem('isAuthenticated');
//     }
//   }
  
//   console.log('🎯 Initialisation terminée');
// }

// // Exécuter l'initialisation avant de render
// initializeAuthState();

// const root = ReactDOM.createRoot(rootElement);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// FRONT/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Cette ligne doit pointer vers un fichier existant

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);