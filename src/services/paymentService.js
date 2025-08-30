/**
 * Service de paiement côté frontend
 * 
 * Ce service gère les interactions avec l'API de paiement
 * et fournit une interface simple pour les composants React
 */

import api from './api';

class PaymentService {
  /**
   * 💳 POINT D'INTÉGRATION FRONTEND - INITIER UNE CONTRIBUTION AVEC PAIEMENT
   * 
   * Cette méthode doit être appelée depuis ContributePage.jsx
   * pour initier un paiement de contribution
   * 
   * @param {Object} contributionData - Données de la contribution
   * @param {string} contributionData.pullId - ID de la cagnotte
   * @param {number} contributionData.amount - Montant de la contribution
   * @param {string} contributionData.phoneNumber - Numéro de téléphone pour le paiement
   * @param {string} contributionData.paymentMethod - Méthode de paiement (orange_money, mtn_money, etc.)
   * @param {string} contributionData.message - Message de contribution (optionnel)
   * @param {boolean} contributionData.isAnonymous - Contribution anonyme
   * @returns {Promise<Object>} Résultat de l'initiation du paiement
   */
  async initiateContribution(contributionData) {
    try {
      console.log('🚀 Initiation contribution avec paiement:', contributionData);

      const response = await api.post('/contributions', {
        pullId: contributionData.pullId,
        amount: contributionData.amount,
        phoneNumber: contributionData.phoneNumber,
        paymentMethod: contributionData.paymentMethod || 'orange_money',
        message: contributionData.message || '',
        isAnonymous: contributionData.isAnonymous || false
      });

      console.log('✅ Contribution initiée:', response.data);

      return {
        success: true,
        contribution: response.data.contribution,
        payment: response.data.payment,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'initiation de contribution:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'initiation du paiement',
        details: error.response?.data?.details,
        code: error.response?.data?.code
      };
    }
  }

  /**
   * 🔍 VÉRIFIER LE STATUT D'UNE CONTRIBUTION
   * 
   * @param {string} contributionId - ID de la contribution
   * @returns {Promise<Object>} Statut de la contribution
   */
  async checkContributionStatus(contributionId) {
    try {
      console.log('🔍 Vérification statut contribution:', contributionId);

      const response = await api.get(`/contributions/${contributionId}/status`);

      return {
        success: true,
        contribution: response.data.contribution,
        cagnotte: response.data.cagnotte,
        transaction: response.data.transaction
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);

      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la vérification du statut'
      };
    }
  }

  /**
   * 📋 OBTENIR LES MÉTHODES DE PAIEMENT DISPONIBLES
   * 
   * @param {string} country - Code pays (optionnel)
   * @returns {Promise<Array>} Liste des méthodes de paiement
   */
  async getPaymentMethods(country = 'SN') {
    try {
      // 🔧 POINT D'INTÉGRATION : Adapter selon votre API
      // Pour l'instant, retourner des méthodes statiques
      // Plus tard, vous pouvez créer un endpoint dédié
      
      const methods = [
        {
          id: 'orange_money',
          name: 'Orange Money',
          icon: '/icons/orange-money.png',
          description: 'Paiement via Orange Money',
          countries: ['SN', 'CI', 'ML', 'BF']
        },
        {
          id: 'mtn_money',
          name: 'MTN Mobile Money',
          icon: '/icons/mtn-money.png',
          description: 'Paiement via MTN Mobile Money',
          countries: ['GH', 'UG', 'RW', 'ZM']
        },
        {
          id: 'moov_money',
          name: 'Moov Money',
          icon: '/icons/moov-money.png',
          description: 'Paiement via Moov Money',
          countries: ['SN', 'CI', 'TG', 'BJ']
        },
        {
          id: 'wave',
          name: 'Wave',
          icon: '/icons/wave.png',
          description: 'Paiement via Wave',
          countries: ['SN', 'CI', 'UG']
        }
      ];

      // Filtrer par pays si spécifié
      const filteredMethods = methods.filter(method => 
        method.countries.includes(country)
      );

      return {
        success: true,
        methods: filteredMethods.length > 0 ? filteredMethods : methods
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des méthodes:', error);

      // Retourner des méthodes par défaut en cas d'erreur
      return {
        success: false,
        methods: [
          {
            id: 'orange_money',
            name: 'Orange Money',
            icon: '/icons/orange-money.png',
            description: 'Paiement via Orange Money'
          }
        ]
      };
    }
  }

  /**
   * 📱 FORMATER UN NUMÉRO DE TÉLÉPHONE
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} countryCode - Code pays par défaut
   * @returns {string} Numéro formaté
   */
  formatPhoneNumber(phoneNumber, countryCode = '+221') {
    // Supprimer les espaces et caractères spéciaux
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ajouter l'indicatif si manquant
    if (!formatted.startsWith('+')) {
      if (formatted.startsWith('0')) {
        formatted = formatted.substring(1);
      }
      formatted = countryCode + formatted;
    }
    
    return formatted;
  }

  /**
   * ✅ VALIDER UN NUMÉRO DE TÉLÉPHONE
   * 
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Object} Résultat de la validation
   */
  validatePhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    
    // Validation basique (à adapter selon vos besoins)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    
    if (!phoneRegex.test(formatted)) {
      return {
        isValid: false,
        error: 'Format de numéro de téléphone invalide',
        formatted: null
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: formatted
    };
  }

  /**
   * 💰 FORMATER UN MONTANT POUR L'AFFICHAGE
   * 
   * @param {number} amount - Montant
   * @param {string} currency - Devise
   * @returns {string} Montant formaté
   */
  formatAmount(amount, currency = 'XOF') {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return formatter.format(amount);
  }

  /**
   * 🎨 OBTENIR L'ICÔNE D'UNE MÉTHODE DE PAIEMENT
   * 
   * @param {string} paymentMethod - ID de la méthode de paiement
   * @returns {string} URL de l'icône
   */
  getPaymentMethodIcon(paymentMethod) {
    const icons = {
      orange_money: '/icons/orange-money.png',
      mtn_money: '/icons/mtn-money.png',
      moov_money: '/icons/moov-money.png',
      wave: '/icons/wave.png'
    };

    return icons[paymentMethod] || '/icons/default-payment.png';
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE PAIEMENT (pour le dashboard)
   * 
   * @returns {Promise<Object>} Statistiques de paiement
   */
  async getPaymentStats() {
    try {
      // 🔧 POINT D'INTÉGRATION : Créer un endpoint dédié si nécessaire
      const response = await api.get('/contributions/my');
      
      const contributions = response.data;
      const stats = {
        totalContributions: contributions.length,
        totalAmount: contributions.reduce((sum, contrib) => sum + contrib.amount, 0),
        successfulPayments: contributions.filter(c => c.status === 'completed').length,
        pendingPayments: contributions.filter(c => c.status === 'pending').length,
        failedPayments: contributions.filter(c => c.status === 'failed').length
      };

      return {
        success: true,
        stats: stats
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);

      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      };
    }
  }
}

export default new PaymentService();