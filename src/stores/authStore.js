/**
 * Store d'authentification centralisé pour KOTIZ
 * Gère l'état d'authentification et l'isolation des données utilisateur
 */
import { create } from 'zustand';
import { authService } from '../services/authService';
import { useCagnotteStore } from './cagnotteStore';

export const useAuthStore = create((set, get) => ({
  // État d'authentification
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // État OTP
  otpStep: null, // null, 'register', 'login'
  confirmationResult: null,
  phoneNumber: null,

  // ==================== ACTIONS D'AUTHENTIFICATION ====================

  /**
   * Initialise l'écouteur d'état d'authentification
   */
  initAuth: () => {
    console.log('🔄 Initialisation de l\'authentification');

    // Vérifier s'il y a un token existant
    const token = localStorage.getItem('token');
    if (token) {
      set({ isAuthenticated: true });
      console.log('✅ Token existant trouvé, utilisateur considéré comme authentifié');
    }
  },

  /**
   * Inscription avec email et mot de passe
   */
  registerWithEmail: async (email, password, displayName, phoneNumber = null) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Tentative d\'inscription avec email');

      const result = await authService.registerWithEmail(email, password, displayName, phoneNumber);

      // Sauvegarder le numéro de téléphone si fourni
      if (phoneNumber) {
        try {
          await authService.savePhoneNumber(phoneNumber);
          console.log('💾 Numéro de téléphone sauvegardé');
        } catch (phoneError) {
          console.warn('⚠️ Erreur sauvegarde numéro téléphone:', phoneError);
        }
      }

      // Marquer comme nouvel utilisateur
      localStorage.setItem('isNewUser', 'true');

      // Nettoyer le store pour éviter les données d'anciens utilisateurs
      useCagnotteStore.getState().reset();

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        otpStep: null,
        confirmationResult: null
      });

      console.log('✅ Inscription email réussie');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Erreur inscription email:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Inscription avec numéro de téléphone (envoi OTP)
   */
  registerWithPhone: async (phoneNumber, displayName = null) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📱 Tentative d\'inscription avec téléphone');

      const result = await authService.registerWithPhone(phoneNumber, displayName);

      set({
        isLoading: false,
        otpStep: 'register',
        confirmationResult: result.confirmationResult,
        phoneNumber: result.phoneNumber
      });

      console.log('✅ OTP d\'inscription envoyé');
      return { success: true, confirmationResult: result.confirmationResult };

    } catch (error) {
      console.error('❌ Erreur inscription téléphone:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Confirmation d'inscription avec téléphone (vérification OTP)
   */
  confirmPhoneRegistration: async (otpCode) => {
    const { confirmationResult, phoneNumber } = get();

    if (!confirmationResult) {
      throw new Error('Aucune session OTP active');
    }

    set({ isLoading: true, error: null });

    try {
      console.log('🔐 Confirmation inscription téléphone');

      const result = await authService.confirmPhoneRegistration(
        confirmationResult,
        otpCode,
        null, // displayName sera géré par Firebase
        phoneNumber
      );

      // Marquer comme nouvel utilisateur
      localStorage.setItem('isNewUser', 'true');

      // Nettoyer le store
      useCagnotteStore.getState().reset();

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        otpStep: null,
        confirmationResult: null,
        phoneNumber: null
      });

      console.log('✅ Inscription téléphone confirmée');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Erreur confirmation inscription:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Connexion avec email et mot de passe
   */
  loginWithEmail: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔑 Tentative de connexion avec email');

      const result = await authService.loginWithEmail(email, password, remember);

      // Nettoyer le store si c'est un nouvel utilisateur
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser) {
        useCagnotteStore.getState().reset();
        localStorage.removeItem('isNewUser');
      }

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        otpStep: null,
        confirmationResult: null
      });

      console.log('✅ Connexion email réussie');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Erreur connexion email:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Connexion avec numéro de téléphone (envoi OTP)
   */
  loginWithPhone: async (phoneNumber, remember = false) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📱 Tentative de connexion avec téléphone');

      const result = await authService.loginWithPhone(phoneNumber, remember);

      set({
        isLoading: false,
        otpStep: 'login',
        confirmationResult: result.confirmationResult,
        phoneNumber: result.phoneNumber
      });

      console.log('✅ OTP de connexion envoyé');
      return { success: true, confirmationResult: result.confirmationResult };

    } catch (error) {
      console.error('❌ Erreur connexion téléphone:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Confirmation de connexion avec téléphone (vérification OTP)
   */
  confirmPhoneLogin: async (otpCode) => {
    const { confirmationResult } = get();

    if (!confirmationResult) {
      throw new Error('Aucune session OTP active');
    }

    set({ isLoading: true, error: null });

    try {
      console.log('🔐 Confirmation connexion téléphone');

      const result = await authService.confirmPhoneLogin(confirmationResult, otpCode);

      // Nettoyer le store si c'est un nouvel utilisateur
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser) {
        useCagnotteStore.getState().reset();
        localStorage.removeItem('isNewUser');
      }

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        otpStep: null,
        confirmationResult: null,
        phoneNumber: null
      });

      console.log('✅ Connexion téléphone confirmée');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Erreur confirmation connexion:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Réinitialisation de mot de passe
   */
  resetPassword: async (identifier) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔑 Réinitialisation de mot de passe pour:', identifier);

      const identifierType = authService.detectIdentifierType(identifier);

      if (identifierType === 'email') {
        const result = await authService.resetPassword(identifier);
        set({ isLoading: false });
        return result;
      } else {
        // Pour le téléphone, on pourrait implémenter une logique différente
        throw new Error('La réinitialisation par téléphone n\'est pas encore implémentée');
      }

    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('🚪 Déconnexion');

      await authService.logout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        otpStep: null,
        confirmationResult: null,
        phoneNumber: null
      });

      console.log('✅ Déconnexion réussie');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Renvoi d'email de vérification
   */
  resendEmailVerification: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.resendEmailVerification();
      set({ isLoading: false });
      return result;

    } catch (error) {
      console.error('❌ Erreur renvoi email vérification:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Réinitialise l'état d'erreur
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Annule l'OTP en cours
   */
  cancelOTP: () => {
    set({
      otpStep: null,
      confirmationResult: null,
      phoneNumber: null,
      error: null
    });
  },

  /**
   * Vérifie si l'utilisateur actuel a un email vérifié
   */
  isEmailVerified: () => {
    return authService.isEmailVerified();
  },

  /**
   * Obtient l'utilisateur actuel
   */
  getCurrentUser: () => {
    return authService.getCurrentUser();
  }
}));