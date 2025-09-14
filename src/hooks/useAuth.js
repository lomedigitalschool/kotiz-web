import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { isTokenExpired } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log('🔄 Initialisation du hook useAuth');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('👤 Changement d\'état Firebase:', currentUser ? `Connecté (${currentUser.email})` : 'Déconnecté');

      if (currentUser) {
        try {
          // Obtenir un token frais et le stocker
          const idToken = await currentUser.getIdToken();
          localStorage.setItem('token', idToken);
          setToken(idToken);
          console.log('✅ Token Firebase obtenu et stocké dans localStorage');

          // Vérifier la validité du token
          const isValid = !isTokenExpired(idToken);
          console.log('🔍 Token valide:', isValid);

        } catch (error) {
          console.error('❌ Erreur lors de la récupération du token:', error);
          // En cas d'erreur, on garde quand même l'utilisateur connecté si Firebase le confirme
          // Le token sera récupéré plus tard
          setToken(null);
        }
      } else {
        // Utilisateur déconnecté
        localStorage.removeItem('token');
        setToken(null);
        console.log('🚪 Token supprimé (utilisateur déconnecté)');
      }

      setUser(currentUser);
      setLoading(false);
      console.log('🔄 État de chargement terminé - Authentification déterminée');

      // Tentative de récupération du token en arrière-plan si elle a échoué
      if (currentUser && !localStorage.getItem('token')) {
        setTimeout(async () => {
          try {
            const retryToken = await currentUser.getIdToken();
            localStorage.setItem('token', retryToken);
            setToken(retryToken);
            console.log('✅ Token récupéré en arrière-plan');
          } catch (retryError) {
            console.error('❌ Échec récupération token en arrière-plan:', retryError);
          }
        }, 1000); // Attendre 1 seconde avant de réessayer
      }
    });

    return () => {
      console.log('🧹 Nettoyage du listener Firebase');
      unsubscribe();
    };
  }, []);

  // Fonction pour forcer le refresh du token
  const refreshToken = async () => {
    if (user) {
      try {
        const newToken = await user.getIdToken(true); // forceRefresh = true
        localStorage.setItem('token', newToken);
        setToken(newToken);
        console.log('🔄 Token rafraîchi manuellement');
        return newToken;
      } catch (error) {
        console.error('❌ Erreur lors du refresh du token:', error);
        return null;
      }
    }
    return null;
  };

  // Considérer comme authentifié si Firebase confirme la connexion
  // Même si le token n'est pas encore disponible (erreur de récupération)
  const isAuthenticated = !!user;

  console.log('🔄 Hook useAuth - État rendu:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated,
    loading
  });

  return {
    user,
    loading,
    token,
    isAuthenticated,
    refreshToken
  };
}