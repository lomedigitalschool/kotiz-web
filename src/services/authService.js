/**
 * Service d'authentification centralisé pour KOTIZ
 * Gère tous les flows d'authentification : email/password, téléphone OTP, inscription
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { updateUserPhone } from './api';
import { useCagnotteStore } from '../stores/cagnotteStore';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.currentUser = null;
    this.initRecaptcha();
    this.initAuthStateListener();
  }

  // ==================== INITIALISATION ====================

  /**
   * Initialise reCAPTCHA pour l'OTP téléphone
   */
  initRecaptcha() {
    if (typeof window !== 'undefined' && !this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('✅ reCAPTCHA réussi');
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA expiré');
          }
        });
      } catch (error) {
        console.error('❌ Erreur initialisation reCAPTCHA:', error);
      }
    }
  }

  /**
   * Initialise l'écouteur d'état d'authentification
   */
  initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      if (user) {
        // Utilisateur connecté - rafraîchir token
        try {
          const token = await user.getIdToken();
          localStorage.setItem('token', token);
          console.log('🔄 Token Firebase mis à jour');
        } catch (error) {
          console.error('❌ Erreur mise à jour token:', error);
        }
      } else {
        // Utilisateur déconnecté - nettoyer
        localStorage.removeItem('token');
        localStorage.removeItem('isNewUser');
        console.log('🚪 Utilisateur déconnecté, nettoyage effectué');
      }
    });
  }

  // ==================== UTILITAIRES ====================

  /**
   * Détecte le type d'identifiant (email ou téléphone)
   */
  detectIdentifierType(identifier) {
    return identifier.includes('@') ? 'email' : 'phone';
  }

  /**
   * Formate un numéro de téléphone au format E.164
   */
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.match(/^\d/)) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  }

  /**
   * Nettoie complètement le store et localStorage
   */
  cleanUserData() {
    console.log('🧹 Nettoyage complet des données utilisateur');

    // Nettoyer le store Zustand
    useCagnotteStore.getState().reset();

    // Nettoyer localStorage (sauf quelques clés essentielles)
    const keysToKeep = ['rememberMe'];
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Gère une connexion réussie
   */
  async handleSuccessfulLogin(user, options = {}) {
    try {
      console.log('🎉 Connexion réussie, utilisateur:', user.uid);

      // Attendre la synchronisation Firebase
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtenir le token
      const idToken = await user.getIdToken(true);
      localStorage.setItem('token', idToken);

      // Marquer comme nouvel utilisateur si demandé
      if (options.isNewUser) {
        localStorage.setItem('isNewUser', 'true');
      }

      // Stocker la préférence "se souvenir de moi"
      if (options.remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Attendre encore pour la synchronisation
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('✅ Préparation terminée, redirection possible');
      return { success: true, user, token: idToken };

    } catch (error) {
      console.error('❌ Erreur après connexion:', error);
      throw new Error("Erreur lors de la finalisation de la connexion");
    }
  }

  // ==================== INSCRIPTION ====================

  /**
   * Inscription avec email et mot de passe
   */
  async registerWithEmail(email, password, displayName, phoneNumber = null) {
    try {
      // ✅ Validation stricte : email obligatoire pour ce flow
      if (!email || !email.trim()) {
        throw new Error('Email requis pour l\'inscription par email');
      }

      if (!password || password.length < 6) {
        throw new Error('Mot de passe requis (minimum 6 caractères)');
      }

      console.log('📝 Inscription avec email:', email);

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Mettre à jour le profil
      const profileUpdates = {};
      if (displayName) {
        profileUpdates.displayName = displayName;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user, profileUpdates);
      }

      // Envoyer email de vérification
      try {
        await sendEmailVerification(user);
        console.log('📧 Email de vérification envoyé à:', email);
      } catch (verificationError) {
        console.warn('⚠️ Erreur envoi email vérification:', verificationError.message);
      }

      return { user, phoneNumber };

    } catch (error) {
      console.error('❌ Erreur inscription email:', error);
      throw this.formatFirebaseError(error);
    }
  }

  /**
   * Inscription avec numéro de téléphone (OTP)
   */
  async registerWithPhone(phoneNumber, displayName = null) {
    try {
      // ✅ Validation stricte : numéro de téléphone obligatoire pour ce flow
      if (!phoneNumber || !phoneNumber.trim()) {
        throw new Error('Numéro de téléphone requis pour l\'inscription par téléphone');
      }

      console.log('📱 Inscription avec téléphone:', phoneNumber);

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Validation stricte du format international
      if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error("Format de numéro de téléphone invalide. Utilisez le format international (+22501020304)");
      }

      // Vérifier que reCAPTCHA est initialisé
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA non initialisé. Veuillez rafraîchir la page.');
      }

      // Envoyer OTP
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, this.recaptchaVerifier);

      return {
        confirmationResult,
        phoneNumber: formattedPhone,
        displayName
      };

    } catch (error) {
      console.error('❌ Erreur inscription téléphone:', error);
      throw this.formatFirebaseError(error);
    }
  }

  /**
   * Confirmer l'inscription avec téléphone (vérifier OTP)
   */
  async confirmPhoneRegistration(confirmationResult, otpCode, displayName = null, phoneNumber = null) {
    try {
      console.log('🔐 Confirmation inscription téléphone');

      const userCredential = await confirmationResult.confirm(otpCode);
      const user = userCredential.user;

      // Mettre à jour le profil si displayName fourni
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Sauvegarder le numéro de téléphone en base
      if (phoneNumber) {
        try {
          await updateUserPhone(phoneNumber);
          console.log('💾 Numéro de téléphone sauvegardé');
        } catch (phoneError) {
          console.warn('⚠️ Erreur sauvegarde numéro téléphone:', phoneError);
        }
      }

      return { user };

    } catch (error) {
      console.error('❌ Erreur confirmation téléphone:', error);
      throw this.formatFirebaseError(error);
    }
  }

  // ==================== CONNEXION ====================

  /**
   * Connexion avec email et mot de passe
   */
  async loginWithEmail(email, password, remember = false) {
    try {
      console.log('🔑 Connexion avec email:', email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return await this.handleSuccessfulLogin(user, { remember });

    } catch (error) {
      console.error('❌ Erreur connexion email:', error);
      throw this.formatFirebaseError(error);
    }
  }

  /**
   * Connexion avec numéro de téléphone (OTP)
   */
  async loginWithPhone(phoneNumber, remember = false) {
    try {
      console.log('📱 Connexion avec téléphone:', phoneNumber);

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Validation du format
      if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error("Format de numéro de téléphone invalide. Utilisez le format international (+225...)");
      }

      // Envoyer OTP
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, this.recaptchaVerifier);

      return {
        confirmationResult,
        phoneNumber: formattedPhone,
        remember
      };

    } catch (error) {
      console.error('❌ Erreur connexion téléphone:', error);
      throw this.formatFirebaseError(error);
    }
  }

  /**
   * Confirmer la connexion avec téléphone (vérifier OTP)
   */
  async confirmPhoneLogin(confirmationResult, otpCode, remember = false) {
    try {
      console.log('🔐 Confirmation connexion téléphone');

      const userCredential = await confirmationResult.confirm(otpCode);
      const user = userCredential.user;

      return await this.handleSuccessfulLogin(user, { remember });

    } catch (error) {
      console.error('❌ Erreur confirmation téléphone:', error);
      throw this.formatFirebaseError(error);
    }
  }

  // ==================== MOT DE PASSE OUBLIÉ ====================

  /**
   * Réinitialisation de mot de passe par email
   */
  async resetPassword(email) {
    try {
      console.log('🔑 Réinitialisation mot de passe pour:', email);

      await sendPasswordResetEmail(auth, email);
      console.log('📧 Email de réinitialisation envoyé');

      return { success: true, message: 'Email de réinitialisation envoyé' };

    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      throw this.formatFirebaseError(error);
    }
  }

  // ==================== DÉCONNEXION ====================

  /**
   * Déconnexion
   */
  async logout() {
    try {
      console.log('🚪 Déconnexion');

      await signOut(auth);
      this.cleanUserData();

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw new Error(error.message);
    }
  }

  // ==================== UTILITAIRES ====================

  /**
   * Formate les erreurs Firebase en messages utilisateur
   */
  formatFirebaseError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun compte trouvé avec ces identifiants',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-email': 'Format d\'email invalide',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
      'auth/invalid-verification-code': 'Code OTP invalide',
      'auth/code-expired': 'Code OTP expiré. Veuillez recommencer',
      'auth/invalid-phone-number': 'Numéro de téléphone invalide',
      'auth/missing-recaptcha-token': 'Erreur de vérification reCAPTCHA',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe est trop faible',
      'auth/operation-not-allowed': 'Cette méthode d\'authentification n\'est pas activée'
    };

    return errorMessages[error.code] || error.message || 'Erreur d\'authentification inattendue';
  }

  /**
   * Obtient l'utilisateur actuel
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Vérifie si l'email de l'utilisateur actuel est vérifié
   */
  isEmailVerified() {
    const user = this.getCurrentUser();
    return user ? user.emailVerified : false;
  }

  /**
   * Renvoie l'email de vérification
   */
  async resendEmailVerification() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      if (user.emailVerified) {
        throw new Error('L\'email est déjà vérifié');
      }

      await sendEmailVerification(user);
      console.log('📧 Email de vérification renvoyé');

      return { success: true, message: 'Email de vérification envoyé' };

    } catch (error) {
      console.error('❌ Erreur renvoi email vérification:', error);
      throw new Error(error.message);
    }
  }
}

// Exporter une instance unique
export const authService = new AuthService();
export default authService;