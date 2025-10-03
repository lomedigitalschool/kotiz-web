import { create } from 'zustand';
import { authService } from '../services/authService';

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

  initAuth: () => {
    console.log('🔄 Initialisation de l\'authentification');

    const token = localStorage.getItem('token');
    if (token) {
      set({ isAuthenticated: true });
      console.log('✅ Token existant trouvé, utilisateur considéré comme authentifié');
    }
  },

  registerWithEmail: async (email, password, displayName, phoneNumber = null) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Tentative d\'inscription avec email');

      const result = await authService.registerWithEmail(email, password, displayName, phoneNumber);

      if (phoneNumber) {
        try {
          await authService.savePhoneNumber(phoneNumber);
          console.log('💾 Numéro de téléphone sauvegardé');
        } catch (phoneError) {
          console.warn('⚠️ Erreur sauvegarde numéro téléphone:', phoneError);
        }
      }

      localStorage.setItem('isNewUser', 'true');

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

  registerWithEmailAndPhone: async (email, password, displayName, phoneNumber) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🎯 Tentative d\'inscription unifiée email + téléphone');

      // Utiliser l'API backend pour l'inscription unifiée
      // Utiliser une URL relative basée sur l'environnement
      const baseUrl = process.env.NODE_ENV === 'production'
        ? '' // URL relative en production
        : 'http://localhost:5000'; // URL de développement

      const response = await fetch(`${baseUrl}/api/v1/auth/register-unified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          phoneNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription unifiée');
      }

      const result = await response.json();

      localStorage.setItem('token', result.token);
      localStorage.setItem('isNewUser', 'true');

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        otpStep: null,
        confirmationResult: null
      });

      console.log('✅ Inscription unifiée réussie');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Erreur inscription unifiée:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  registerWithPhone: async (phoneNumber) => {
    set({ isLoading: true, error: null });

    try {
      const confirmationResult = await authService.registerWithPhoneNumber(phoneNumber);
      set({ 
        confirmationResult, 
        isLoading: false,
        phoneNumber,
        otpStep: 'register'
      });
      return confirmationResult;

    } catch (error) {
      console.error('❌ Erreur inscription téléphone:', error);

      if (error.message.includes('reCAPTCHA') || error.message.includes('undefined')) {
        console.warn('🔄 Tentative de réinitialisation reCAPTCHA...');

        authService.cleanupRecaptcha();

        try {
          const confirmationResult = await authService.registerWithPhoneNumber(phoneNumber);
          set({ 
            confirmationResult, 
            isLoading: false,
            phoneNumber,
            otpStep: 'register'
          });
          return confirmationResult;
        } catch (retryError) {
          set({
            error: 'Problème de sécurité. Veuillez recharger la page et réessayer.',
            isLoading: false
          });
        }
      } else {
        let errorMessage = 'Erreur lors de l\'inscription';
        if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'Numéro de téléphone invalide';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        }

        set({ error: errorMessage, isLoading: false });
      }

      throw error;
    }
  },

  verifyCode: async (code) => {
    set({ isLoading: true, error: null });

    try {
      const { confirmationResult } = get();
      if (!confirmationResult) {
        throw new Error('Aucune vérification en cours');
      }

      const user = await authService.verifySMSCode(confirmationResult, code);

      localStorage.setItem('isNewUser', 'true');

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        confirmationResult: null,
        otpStep: null,
        phoneNumber: null
      });

      console.log('✅ Code vérifié avec succès');
      return user;

    } catch (error) {
      console.error('❌ Erreur vérification code:', error);

      const errorMessage = error.code === 'auth/invalid-verification-code'
        ? 'Code de vérification invalide'
        : 'Erreur lors de la vérification';

      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cleanup: () => {
    authService.cleanupRecaptcha();
    set({ 
      confirmationResult: null, 
      error: null,
      otpStep: null,
      phoneNumber: null
    });
  },

  loginWithEmail: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔑 Tentative de connexion avec email');

      const result = await authService.loginWithEmail(email, password, remember);

      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser) {
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

  confirmPhoneLogin: async (otpCode) => {
    const { confirmationResult } = get();

    if (!confirmationResult) {
      throw new Error('Aucune session OTP active');
    }

    set({ isLoading: true, error: null });

    try {
      console.log('🔐 Confirmation connexion téléphone');

      const result = await authService.confirmPhoneLogin(confirmationResult, otpCode);

      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser) {
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
        throw new Error('La réinitialisation par téléphone n\'est pas encore implémentée');
      }

    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('🚪 Déconnexion depuis authStore');
      await authService.logout();
      
      // Reset immédiat de l'état
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        otpStep: null,
        confirmationResult: null,
        phoneNumber: null
      });

      console.log('✅ Déconnexion authStore réussie');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déconnexion authStore:', error);
      // Même en cas d'erreur, on reset
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        otpStep: null,
        confirmationResult: null,
        phoneNumber: null
      });
      return { success: true };
    }
  },

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

  clearError: () => {
    set({ error: null });
  },

  cancelOTP: () => {
    authService.cleanupRecaptcha();
    set({
      otpStep: null,
      confirmationResult: null,
      phoneNumber: null,
      error: null
    });
  },

  isEmailVerified: () => {
    return authService.isEmailVerified();
  },

  getCurrentUser: () => {
    return authService.getCurrentUser();
  }
}));