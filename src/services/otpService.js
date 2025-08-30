/**
 * Service OTP côté frontend
 * 
 * Ce service gère les interactions avec l'API OTP/SMS
 * et fournit une interface simple pour l'authentification à deux facteurs
 */

import api from './api';

class OTPService {
  /**
   * 📱 POINT D'INTÉGRATION FRONTEND - ENVOYER OTP D'INSCRIPTION
   * 
   * Cette méthode doit être appelée depuis Register.jsx
   * pour envoyer un code OTP lors de l'inscription
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendRegistrationOTP(phoneNumber) {
    try {
      console.log('📱 Envoi OTP d\'inscription pour:', phoneNumber);

      const response = await api.post('/auth/send-registration-otp', {
        phone: phoneNumber
      });

      console.log('✅ OTP d\'inscription envoyé:', response.data);

      return {
        success: true,
        message: response.data.message,
        phoneNumber: response.data.phoneNumber,
        expiresIn: response.data.expiresIn
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi OTP inscription:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'envoi du code de vérification',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * 🔑 POINT D'INTÉGRATION FRONTEND - INITIER CONNEXION AVEC OTP
   * 
   * Cette méthode doit être appelée depuis Login.jsx
   * pour initier une connexion avec OTP
   * 
   * @param {string} identifier - Email ou téléphone
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Résultat de l'initiation
   */
  async initiateLogin(identifier, password) {
    try {
      console.log('🔑 Initiation connexion avec OTP pour:', identifier);

      const response = await api.post('/auth/initiate-login', {
        identifier: identifier,
        password: password
      });

      console.log('✅ Connexion initiée:', response.data);

      return {
        success: true,
        requiresOTP: response.data.requiresOTP,
        message: response.data.message,
        userId: response.data.userId,
        phoneNumber: response.data.phoneNumber,
        expiresIn: response.data.expiresIn,
        token: response.data.token, // Si pas d'OTP requis
        user: response.data.user // Si pas d'OTP requis
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'initiation de connexion:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la connexion',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * ✅ VÉRIFIER OTP ET FINALISER INSCRIPTION
   * 
   * @param {Object} registrationData - Données d'inscription
   * @param {string} registrationData.name - Nom complet
   * @param {string} registrationData.email - Email (optionnel)
   * @param {string} registrationData.phone - Téléphone
   * @param {string} registrationData.password - Mot de passe
   * @param {string} registrationData.otpCode - Code OTP
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  async verifyRegistrationOTP(registrationData) {
    try {
      console.log('✅ Vérification OTP inscription pour:', registrationData.phone);

      const response = await api.post('/auth/register', {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        password: registrationData.password,
        otpCode: registrationData.otpCode
      });

      console.log('✅ Inscription réussie:', response.data);

      return {
        success: true,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification OTP inscription:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Code de vérification invalide',
        code: error.response?.data?.code,
        attemptsLeft: error.response?.data?.attemptsLeft
      };
    }
  }

  /**
   * ✅ VÉRIFIER OTP ET FINALISER CONNEXION
   * 
   * @param {string} userId - ID utilisateur
   * @param {string} otpCode - Code OTP
   * @returns {Promise<Object>} Résultat de la connexion
   */
  async verifyLoginOTP(userId, otpCode) {
    try {
      console.log('✅ Vérification OTP connexion pour:', userId);

      const response = await api.post('/auth/login', {
        userId: userId,
        otpCode: otpCode
      });

      console.log('✅ Connexion réussie:', response.data);

      return {
        success: true,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification OTP connexion:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Code de vérification invalide',
        code: error.response?.data?.code,
        attemptsLeft: error.response?.data?.attemptsLeft
      };
    }
  }

  /**
   * 🔄 RENVOYER UN CODE OTP
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} purpose - Objectif (registration, login, password_reset)
   * @returns {Promise<Object>} Résultat du renvoi
   */
  async resendOTP(phoneNumber, purpose = 'login') {
    try {
      console.log('🔄 Renvoi OTP pour:', phoneNumber, purpose);

      const response = await api.post('/auth/resend-otp', {
        phoneNumber: phoneNumber,
        purpose: purpose
      });

      console.log('✅ OTP renvoyé:', response.data);

      return {
        success: true,
        message: response.data.message,
        phoneNumber: response.data.phoneNumber,
        expiresIn: response.data.expiresIn
      };

    } catch (error) {
      console.error('❌ Erreur lors du renvoi OTP:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du renvoi du code',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * 🔐 DEMANDER RÉINITIALISATION DE MOT DE PASSE
   * 
   * @param {string} identifier - Email ou téléphone
   * @returns {Promise<Object>} Résultat de la demande
   */
  async requestPasswordReset(identifier) {
    try {
      console.log('🔐 Demande réinitialisation pour:', identifier);

      const response = await api.post('/auth/request-password-reset', {
        identifier: identifier
      });

      console.log('✅ Demande de réinitialisation envoyée:', response.data);

      return {
        success: true,
        message: response.data.message,
        phoneNumber: response.data.phoneNumber,
        expiresIn: response.data.expiresIn
      };

    } catch (error) {
      console.error('❌ Erreur lors de la demande de réinitialisation:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la demande de réinitialisation'
      };
    }
  }

  /**
   * 🔐 RÉINITIALISER MOT DE PASSE AVEC OTP
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} otpCode - Code OTP
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat de la réinitialisation
   */
  async resetPassword(phoneNumber, otpCode, newPassword) {
    try {
      console.log('🔐 Réinitialisation mot de passe pour:', phoneNumber);

      const response = await api.post('/auth/reset-password', {
        phoneNumber: phoneNumber,
        otpCode: otpCode,
        newPassword: newPassword
      });

      console.log('✅ Mot de passe réinitialisé:', response.data);

      return {
        success: true,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la réinitialisation',
        code: error.response?.data?.code,
        attemptsLeft: error.response?.data?.attemptsLeft
      };
    }
  }

  /**
   * 📱 FORMATER UN NUMÉRO DE TÉLÉPHONE POUR L'AFFICHAGE
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {string} Numéro formaté pour l'affichage
   */
  formatPhoneForDisplay(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Masquer une partie du numéro pour la sécurité
    // Exemple: +221701234567 -> +221***4567
    if (phoneNumber.length > 8) {
      const start = phoneNumber.substring(0, 4);
      const end = phoneNumber.substring(phoneNumber.length - 4);
      return `${start}***${end}`;
    }
    
    return phoneNumber;
  }

  /**
   * ⏱️ FORMATER LE TEMPS D'EXPIRATION
   * 
   * @param {number} expiresIn - Temps d'expiration en secondes
   * @returns {string} Temps formaté
   */
  formatExpirationTime(expiresIn) {
    if (!expiresIn) return '';
    
    const minutes = Math.floor(expiresIn / 60);
    const seconds = expiresIn % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * ✅ VALIDER UN CODE OTP
   * 
   * @param {string} otpCode - Code OTP
   * @returns {Object} Résultat de la validation
   */
  validateOTPCode(otpCode) {
    if (!otpCode) {
      return {
        isValid: false,
        error: 'Code de vérification requis'
      };
    }

    // Supprimer les espaces
    const cleanCode = otpCode.replace(/\s/g, '');

    // Vérifier que c'est un nombre de 6 chiffres
    if (!/^\d{6}$/.test(cleanCode)) {
      return {
        isValid: false,
        error: 'Le code doit contenir exactement 6 chiffres'
      };
    }

    return {
      isValid: true,
      cleanCode: cleanCode
    };
  }

  /**
   * 🎨 OBTENIR LA COULEUR DU STATUT OTP
   * 
   * @param {string} status - Statut (pending, verified, expired, failed)
   * @returns {string} Classe CSS de couleur
   */
  getStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600',
      verified: 'text-green-600',
      expired: 'text-red-600',
      failed: 'text-red-600',
      sent: 'text-blue-600'
    };

    return colors[status] || 'text-gray-600';
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES OTP (pour le debug/admin)
   * 
   * @returns {Object} Statistiques locales
   */
  getOTPStats() {
    // Récupérer les stats depuis le localStorage si nécessaire
    const stats = JSON.parse(localStorage.getItem('otp_stats') || '{}');
    
    return {
      totalSent: stats.totalSent || 0,
      totalVerified: stats.totalVerified || 0,
      totalFailed: stats.totalFailed || 0,
      lastSent: stats.lastSent || null
    };
  }

  /**
   * 💾 SAUVEGARDER LES STATISTIQUES OTP
   * 
   * @param {string} action - Action (sent, verified, failed)
   */
  updateOTPStats(action) {
    const stats = this.getOTPStats();
    
    switch (action) {
      case 'sent':
        stats.totalSent++;
        stats.lastSent = new Date().toISOString();
        break;
      case 'verified':
        stats.totalVerified++;
        break;
      case 'failed':
        stats.totalFailed++;
        break;
    }
    
    localStorage.setItem('otp_stats', JSON.stringify(stats));
  }
}

export default new OTPService();