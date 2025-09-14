import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthGuard = ({ children, requireAuth = true }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise mais que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 Accès refusé - Redirection vers login', {
      requireAuth,
      isAuthenticated,
      hasUser: !!user,
      loading
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté mais qu'on est sur une page publique (login/register)
  if (!requireAuth && isAuthenticated) {
    console.log('✅ Utilisateur connecté - Redirection vers dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Rendre le composant enfant
  return children;
};

export default AuthGuard;