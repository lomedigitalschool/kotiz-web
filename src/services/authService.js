import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { updateUserPhone } from './api';
import { useCagnotteStore } from '../stores/cagnotteStore';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.currentUser = null;
    this.recaptchaInitialized = false;
    this.initAuthStateListener();
  }

  // SOLUTION DÉFINITIVE : RecaptchaVerifier factice pour les tests
  async initRecaptcha() {
    if (this.recaptchaInitialized && this.recaptchaVerifier) {
      return true;
    }

    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('Conteneur reCAPTCHA introuvable');
    }

    try {
      console.log('🛡️ Initialisation de reCAPTCHA...');

      // En développement, créer un RecaptchaVerifier factice
      if (window.location.hostname === 'localhost') {
        console.log('🔧 Mode développement - RecaptchaVerifier factice');
        
        // Créer un objet factice qui simule RecaptchaVerifier
        window.recaptchaVerifier = {
          render: async () => {
            console.log('✅ RecaptchaVerifier factice rendu');
            return Promise.resolve();
          },
          clear: () => {
            console.log('🧹 RecaptchaVerifier factice nettoyé');
          },
          verify: () => {
            console.log('✅ RecaptchaVerifier factice vérifié');
            return Promise.resolve('fake-recaptcha-token');
          },
          _reset: () => {
            console.log('🔄 RecaptchaVerifier factice reset');
          },
          type: 'recaptcha'
        };
      } else {
        // En production, utiliser le vrai RecaptchaVerifier
        const { RecaptchaVerifier } = await import('firebase/auth');
        window.recaptchaVerifier = new RecaptchaVerifier(
          'recaptcha-container',
          { size: 'invisible' },
          auth
        );
        await window.recaptchaVerifier.render();
      }

      this.recaptchaVerifier = window.recaptchaVerifier;
      this.recaptchaInitialized = true;
      console.log('✅ reCAPTCHA initialisé');

      return true;
    } catch (error) {
      console.error('❌ Erreur reCAPTCHA:', error);
      this.recaptchaInitialized = false;
      throw new Error(`Échec reCAPTCHA: ${error.message}`);
    }
  }

  async registerWithPhoneNumber(phoneNumber) {
    try {
      await this.initRecaptcha();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Vérifier si un compte existe déjà avec ce numéro
      // Note: Firebase ne fournit pas directement une méthode pour vérifier les numéros de téléphone
      // comme pour les emails, donc on laisse Firebase gérer cela lors de signInWithPhoneNumber

      // En développement avec numéro de test, simuler complètement
      if (window.location.hostname === 'localhost' && formattedPhone === '+22899974644') {
        console.log('📱 Simulation complète pour numéro de test');

        return {
          confirm: async (code) => {
            if (code === '974644') {
              // Créer un utilisateur anonyme Firebase
              const { signInAnonymously } = await import('firebase/auth');
              const userCredential = await signInAnonymously(auth);
              return userCredential;
            } else {
              throw new Error('Code de vérification invalide');
            }
          }
        };
      }

      // Pour les vrais numéros, utiliser Firebase normal
      // signInWithPhoneNumber gère automatiquement la création/liason de comptes
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      console.log(`📱 SMS envoyé à ${formattedPhone} pour inscription`);
      return confirmationResult;
    } catch (error) {
      this.cleanupRecaptcha();
      throw error;
    }
  }

  initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem('token', token);
        } catch (error) {
          console.error('❌ Erreur token:', error);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('isNewUser');
      }
    });
  }

  detectIdentifierType(identifier) {
    return identifier.includes('@') ? 'email' : 'phone';
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.match(/^\d/)) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  }

  cleanUserData() {
    useCagnotteStore.getState().reset();
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

  async handleSuccessfulLogin(user, options = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const idToken = await user.getIdToken(true);
      localStorage.setItem('token', idToken);
      if (options.isNewUser) {
        localStorage.setItem('isNewUser', 'true');
      }
      if (options.remember) {
        localStorage.setItem('rememberMe', 'true');
      }
      return { success: true, user, token: idToken };
    } catch (error) {
      throw new Error("Erreur finalisation connexion");
    }
  }
/**
 * Vérifie si un compte existe déjà avec cet email ou téléphone
 * @param {string} email - Email à vérifier
 * @param {string} phone - Téléphone à vérifier
 * @returns {Object} Informations sur les comptes existants
 */
async checkExistingAccounts(email, phone) {
  try {
    const existingAccounts = {
      email: null,
      phone: null,
      hasConflicts: false
    };

    // Vérifier l'email
    if (email) {
      try {
        const emailMethods = await fetchSignInMethodsForEmail(auth, email);
        if (emailMethods.length > 0) {
          existingAccounts.email = {
            methods: emailMethods,
            exists: true
          };
          existingAccounts.hasConflicts = true;
        }
      } catch (error) {
        // Email n'existe pas, c'est normal
      }
    }

    // Vérifier le téléphone (plus complexe côté client)
    // On peut utiliser une approche différente pour le téléphone

    return existingAccounts;
  } catch (error) {
    console.warn('Erreur vérification comptes existants:', error);
    return { email: null, phone: null, hasConflicts: false };
  }
}

async registerWithEmail(email, password, displayName, phoneNumber = null) {
  try {
    if (!email?.trim()) throw new Error('Email requis');
    if (!password || password.length < 6) throw new Error('Mot de passe requis (min 6 caractères)');

    // Vérifier si un compte existe déjà
    const existingAccounts = await this.checkExistingAccounts(email, phoneNumber);

    if (existingAccounts.hasConflicts) {
      throw new Error(
        `Un compte existe déjà avec cet email. Essayez de vous connecter ou contactez le support.`
      );
    }

    // Utiliser signInWithCredential au lieu de createUserWithEmailAndPassword
    // pour une meilleure gestion des liens
    const credential = EmailAuthProvider.credential(email.trim(), password);

    try {
      // Essayer d'abord de se connecter (au cas où le compte existe)
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('🔄 Compte existant détecté, connexion réussie');
      return { user: userCredential.user, phoneNumber, wasExisting: true };
    } catch (signInError) {
      // Si la connexion échoue, c'est probablement un nouveau compte
      if (signInError.code === 'auth/user-not-found') {
        // Créer le nouveau compte
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        if (displayName) {
          await updateProfile(user, { displayName });
        }

        try {
          await sendEmailVerification(user);
        } catch (verificationError) {
          console.warn('⚠️ Erreur email vérification:', verificationError.message);
        }

        return { user, phoneNumber, wasExisting: false };
      } else {
        throw signInError;
      }
    }
  } catch (error) {
    throw this.formatFirebaseError(error);
  }
}

  async verifySMSCode(confirmationResult, code) {
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  cleanupRecaptcha() {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    this.recaptchaVerifier = null;
    this.recaptchaInitialized = false;
  }

  async loginWithEmail(email, password, remember = false) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await this.handleSuccessfulLogin(userCredential.user, { remember });
    } catch (error) {
      throw this.formatFirebaseError(error);
    }
  }

  async loginWithPhone(phoneNumber, remember = false) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error("Format téléphone invalide");
      }

      await this.initRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);

      return { confirmationResult, phoneNumber: formattedPhone, remember };
    } catch (error) {
      throw this.formatFirebaseError(error);
    }
  }

  async confirmPhoneLogin(confirmationResult, otpCode, remember = false) {
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      return await this.handleSuccessfulLogin(userCredential.user, { remember });
    } catch (error) {
      throw this.formatFirebaseError(error);
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Email de réinitialisation envoyé' };
    } catch (error) {
      throw this.formatFirebaseError(error);
    }
  }

  async logout() {
    try {
      console.log('🚪 Déconnexion Firebase');
      
      // Nettoyer immédiatement les données locales
      this.cleanUserData();
      this.cleanupRecaptcha();
      
      // Puis déconnecter Firebase
      await signOut(auth);
      
      console.log('✅ Déconnexion Firebase réussie');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déconnexion Firebase:', error);
      // Même en cas d'erreur, nettoyer les données
      this.cleanUserData();
      this.cleanupRecaptcha();
      return { success: true };
    }
  }

  formatFirebaseError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun compte trouvé',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-email': 'Email invalide',
      'auth/user-disabled': 'Compte désactivé',
      'auth/too-many-requests': 'Trop de tentatives',
      'auth/invalid-verification-code': 'Code OTP invalide',
      'auth/code-expired': 'Code OTP expiré',
      'auth/invalid-phone-number': 'Numéro invalide',
      'auth/email-already-in-use': 'Email déjà utilisé',
      'auth/weak-password': 'Mot de passe trop faible'
    };
    return errorMessages[error.code] || error.message || 'Erreur authentification';
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  isEmailVerified() {
    const user = this.getCurrentUser();
    return user ? user.emailVerified : false;
  }

  async resendEmailVerification() {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('Aucun utilisateur connecté');
      if (user.emailVerified) throw new Error('Email déjà vérifié');

      await sendEmailVerification(user);
      return { success: true, message: 'Email de vérification envoyé' };
    } catch (error) {
      throw new Error(error.message);
    }
  }


  /**
   * Vérifie si l'utilisateur actuel a plusieurs providers liés
   * @returns {Object} Informations sur les providers
   */
  getLinkedProviders() {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      phoneNumber: user.phoneNumber,
      providers: user.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        displayName: provider.displayName
      })),
      isEmailVerified: user.emailVerified
    };
  }
}

export const authService = new AuthService();
export default authService;