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
  console.log('🌐 apiFetch appelé pour:', url);

  // Obtenir le token depuis localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ Pas de token disponible');
    throw new Error('Non authentifié');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  console.log('📤 Envoi requête avec token');

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders
  });

  console.log('📥 Réponse reçue:', response.status);

  // Gestion des tokens expirés
  if (response.status === 401) {
    console.warn('⚠️ Token expiré - nettoyage');
    localStorage.removeItem('token');
    
    // Essayer de rafraîchir le token si Firebase user existe
    if (auth.currentUser) {
      try {
        const newToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem('token', newToken);
        
        // Relancer la requête
        return await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            Authorization: `Bearer ${newToken}`
          }
        });
      } catch (refreshError) {
        console.error('❌ Échec refresh token:', refreshError);
      }
    }
    
    throw new Error('Session expirée');
  }

  return response;
}

// Fonction spécifique pour mettre à jour le numéro de téléphone
export async function updateUserPhone(phoneNumber) {
  try {
    const response = await api.post('/auth/update-phone', { phone: phoneNumber });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro de téléphone:', error);
    throw error;
  }
}

export default api;