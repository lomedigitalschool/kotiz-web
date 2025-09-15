import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useCagnotteStore } from '../stores/cagnotteStore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔄 Initialisation AuthContext');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('👤 Changement d\'état Firebase:', firebaseUser?.uid || 'Déconnecté');
      
      if (firebaseUser) {
        // Utilisateur connecté
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', token);
          
          setUser(firebaseUser);
          setIsAuthenticated(true);
          
          console.log('✅ Utilisateur authentifié:', firebaseUser.uid);
          
          // Recharger les données utilisateur après un court délai
          setTimeout(() => {
            useCagnotteStore.getState().fetchUserCagnottes();
          }, 500);
          
        } catch (error) {
          console.error('❌ Erreur récupération token:', error);
          handleLogout();
        }
      } else {
        // Utilisateur déconnecté
        handleLogout();
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🧹 Nettoyage AuthContext');
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    console.log('🚪 Nettoyage complet lors de la déconnexion');
    
    // Nettoyer Firebase
    setUser(null);
    setIsAuthenticated(false);
    
    // Nettoyer localStorage COMPLÈTEMENT
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('cagnottes');
    localStorage.removeItem('contributions');
    localStorage.removeItem('cagnotte');
    localStorage.removeItem('localCagnottes');
    localStorage.removeItem('userContributions');
    
    console.log('🧹 localStorage nettoyé complètement');
    
    // Nettoyer tous les stores
    useCagnotteStore.getState().reset();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};