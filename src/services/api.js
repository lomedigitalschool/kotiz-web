import axios from 'axios';
import { auth } from '../config/firebase';
import { isTokenExpired, getValidToken, getCurrentUserToken } from './auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token Firebase d'authentification
api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        try {
            const token = await getValidToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du token Firebase:', error);
        }
    }
    return config;
});

// Intercepteur pour gérer les erreurs de réponse (notamment 401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('🚨 Erreur 401 détectée');

            // Vérifier si Firebase considère l'utilisateur comme connecté
            if (auth.currentUser) {
                console.log('🔄 Utilisateur Firebase connecté, tentative de refresh du token');

                try {
                    // Essayer de rafraîchir le token
                    const newToken = await auth.currentUser.getIdToken(true);
                    localStorage.setItem('token', newToken);

                    // Relancer la requête avec le nouveau token
                    const originalRequest = error.config;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    console.log('✅ Token rafraîchi, relance de la requête');
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('❌ Échec du refresh du token:', refreshError);
                }
            }

            // Si on arrive ici, c'est vraiment une déconnexion
            console.log('🚪 Déconnexion réelle détectée');
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');

            // Rediriger vers la page de connexion
            if (window.location.pathname !== '/login') {
                alert('Votre session a expiré. Veuillez vous reconnecter.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Wrapper pour fetch avec token automatique et gestion d'expiration
export async function apiFetch(url, options = {}) {
  // Vérifier d'abord si Firebase considère l'utilisateur comme connecté
  const isFirebaseAuthenticated = auth.currentUser !== null;

  // Obtenir un token valide (avec cache et refresh automatique)
  const token = await getValidToken();

  // Si pas de token mais Firebase dit que l'utilisateur est connecté,
  // attendre un peu que Firebase mette à jour le token
  if (!token && isFirebaseAuthenticated) {
    console.log('⏳ Token manquant mais Firebase indique utilisateur connecté, attente...');
    // Attendre jusqu'à 2 secondes que Firebase mette à jour le session
    let attempts = 0;
    while (attempts < 20) { // 20 * 100ms = 2 secondes max
      await new Promise(resolve => setTimeout(resolve, 100));
      const freshToken = localStorage.getItem('token');
      if (freshToken) {
        console.log('✅ Token récupéré après attente');
        break;
      }
      attempts++;
    }
  }

  const finalToken = localStorage.getItem('token') || token;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(finalToken && { Authorization: `Bearer ${finalToken}` }),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders
  });

  // Gestion réactive des tokens expirés (au cas où)
  if (response.status === 401) {
    // Vérifier encore une fois si Firebase considère l'utilisateur comme connecté
    if (auth.currentUser) {
      console.log('⚠️ 401 reçu mais Firebase indique utilisateur connecté - Token peut-être expiré côté serveur');
      // Essayer de rafraîchir le token
      try {
        const newToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem('token', newToken);
        console.log('🔄 Token rafraîchi suite à 401');

        // Relancer la requête avec le nouveau token
        const retryHeaders = {
          ...defaultHeaders,
          Authorization: `Bearer ${newToken}`
        };

        return await fetch(url, {
          ...options,
          headers: retryHeaders
        });
      } catch (refreshError) {
        console.error('❌ Échec du refresh du token:', refreshError);
      }
    }

    // Si on arrive ici, c'est vraiment une déconnexion
    localStorage.removeItem('token');
    if (window.location.pathname !== '/login') {
      alert('Votre session a expiré. Veuillez vous reconnecter.');
      window.location.href = '/login';
    }
  }

  return response;
}

export default api;