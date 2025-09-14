// Service d'authentification
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';

// Fonction pour se connecter avec email et mot de passe
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Le token sera automatiquement sauvegardé par onAuthStateChange
    return { user };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fonction pour s'inscrire
export const registerWithEmail = async (email, password, displayName, phoneNumber = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mettre à jour le profil avec le displayName
    const profileUpdates = {};
    if (displayName) {
      profileUpdates.displayName = displayName;
    }

    // Note: Firebase Auth ne permet pas de définir le numéro de téléphone via updateProfile
    // Le numéro de téléphone doit être défini lors de la connexion avec numéro de téléphone
    // Nous le stockerons dans la base de données via le backend

    if (Object.keys(profileUpdates).length > 0) {
      await updateProfile(user, profileUpdates);
    }

    // Envoyer automatiquement l'email de vérification
    try {
      await sendEmailVerification(user);
      console.log('Email de vérification envoyé à:', email);
    } catch (verificationError) {
      console.warn('Erreur lors de l\'envoi de l\'email de vérification:', verificationError.message);
      // Ne pas bloquer l'inscription si l'email de vérification échoue
    }

    // Le token sera automatiquement sauvegardé par onAuthStateChange
    return { user, phoneNumber }; // Retourner aussi le numéro de téléphone pour le backend
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fonction pour se déconnecter
export const logout = async () => {
  try {
    await signOut(auth);
    // Nettoyer les flags locaux
    localStorage.removeItem('isNewUser');
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fonction pour écouter les changements d'état d'authentification
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Mettre à jour le token dans localStorage quand l'utilisateur se connecte
      try {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        console.log('Token mis à jour suite à changement d\'état Firebase');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du token:', error);
      }
    } else {
      // Supprimer le token quand l'utilisateur se déconnecte
      localStorage.removeItem('token');
      console.log('Token supprimé suite à déconnexion Firebase');
    }

    // Appeler le callback original
    if (callback) callback(user);
  });
};

// Fonction pour obtenir le token actuel
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Fonction pour vérifier si un token JWT est expiré
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000; // Convertir en secondes
    const timeToExpiry = payload.exp - currentTime;

    // Considérer comme expiré si moins de 5 minutes restantes
    return timeToExpiry < 300; // 5 minutes en secondes
  } catch (error) {
    console.warn('Erreur lors de la vérification du token:', error);
    return true; // Considérer comme expiré si erreur
  }
};

// Fonction pour obtenir un token valide (avec cache et refresh)
export const getValidToken = async () => {
  const cachedToken = localStorage.getItem('token');

  // Si pas de token en cache, en obtenir un nouveau
  if (!cachedToken) {
    if (auth.currentUser) {
      const newToken = await auth.currentUser.getIdToken();
      localStorage.setItem('token', newToken);
      return newToken;
    }
    return null;
  }

  // Vérifier si le token est expiré ou va expirer bientôt
  if (isTokenExpired(cachedToken)) {
    try {
      // Rafraîchir le token
      const newToken = await auth.currentUser.getIdToken(true); // forceRefresh = true
      localStorage.setItem('token', newToken);
      console.log('Token rafraîchi automatiquement');
      return newToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      // En cas d'erreur, supprimer le token expiré
      localStorage.removeItem('token');
      return null;
    }
  }

  return cachedToken;
};

// Fonction pour renvoyer l'email de vérification
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    if (user.emailVerified) {
      throw new Error('L\'email est déjà vérifié');
    }

    await sendEmailVerification(user);
    console.log('Email de vérification renvoyé à:', user.email);
    return { success: true, message: 'Email de vérification envoyé' };
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email de vérification:', error);
    throw new Error(error.message);
  }
};

// Fonction pour vérifier si l'email de l'utilisateur actuel est vérifié
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// Fonction pour recharger l'utilisateur actuel (utile après vérification d'email)
export const reloadCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du rechargement de l\'utilisateur:', error);
    throw new Error(error.message);
  }
};