/**
 * Utilitaires de test pour l'authentification KOTIZ
 * Permet de tester les différents flows d'inscription et connexion
 */

import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { useCagnotteStore } from '../stores/cagnotteStore';

export class AuthTester {
  constructor() {
    this.results = [];
  }

  /**
   * Test d'inscription avec email
   */
  async testEmailRegistration() {
    console.log('🧪 Test: Inscription avec email');

    const testData = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123456',
      displayName: 'Test User',
      phoneNumber: '+22501020304'
    };

    try {
      const result = await authService.registerWithEmail(
        testData.email,
        testData.password,
        testData.displayName,
        testData.phoneNumber
      );

      this.results.push({
        test: 'Email Registration',
        status: '✅ SUCCESS',
        data: testData,
        result: result
      });

      console.log('✅ Test réussi:', result);
      return { success: true, result };

    } catch (error) {
      this.results.push({
        test: 'Email Registration',
        status: '❌ FAILED',
        data: testData,
        error: error.message
      });

      console.error('❌ Test échoué:', error);
      return { success: false, error };
    }
  }

  /**
   * Test de validation des erreurs
   */
  async testErrorValidation() {
    console.log('🧪 Test: Validation des erreurs');

    const errorTests = [
      {
        name: 'Email vide',
        action: () => authService.registerWithEmail('', 'password123', 'Test'),
        expectedError: 'Email requis'
      },
      {
        name: 'Mot de passe trop court',
        action: () => authService.registerWithEmail('test@example.com', '123', 'Test'),
        expectedError: 'Mot de passe requis'
      },
      {
        name: 'Téléphone vide',
        action: () => authService.registerWithPhone('', 'Test'),
        expectedError: 'Numéro de téléphone requis'
      },
      {
        name: 'Format téléphone invalide',
        action: () => authService.registerWithPhone('01020304', 'Test'),
        expectedError: 'Format invalide'
      }
    ];

    const results = [];

    for (const test of errorTests) {
      try {
        await test.action();
        results.push({
          test: test.name,
          status: '❌ FAILED - Erreur non détectée',
          expected: test.expectedError
        });
      } catch (error) {
        if (error.message.includes(test.expectedError)) {
          results.push({
            test: test.name,
            status: '✅ SUCCESS',
            error: error.message
          });
        } else {
          results.push({
            test: test.name,
            status: '❌ FAILED - Mauvaise erreur',
            expected: test.expectedError,
            actual: error.message
          });
        }
      }
    }

    this.results.push(...results);
    console.log('📊 Résultats validation erreurs:', results);
    return results;
  }

  /**
   * Test de nettoyage du store
   */
  async testStoreCleanup() {
    console.log('🧪 Test: Nettoyage du store');

    // Ajouter des données de test
    const testData = {
      cagnottes: [{ id: 1, title: 'Test Cagnotte' }],
      contributions: [{ id: 1, amount: 100 }]
    };

    useCagnotteStore.getState().setCagnottes(testData.cagnottes);
    localStorage.setItem('testData', JSON.stringify(testData));

    // Vérifier que les données sont présentes
    const beforeCleanup = {
      storeCagnottes: useCagnotteStore.getState().cagnottes.length,
      localStorage: localStorage.getItem('testData') ? 'present' : 'absent'
    };

    // Nettoyer
    authService.cleanUserData();

    // Vérifier que les données sont supprimées
    const afterCleanup = {
      storeCagnottes: useCagnotteStore.getState().cagnottes.length,
      localStorage: localStorage.getItem('testData') ? 'present' : 'absent'
    };

    const success = afterCleanup.storeCagnottes === 0 && afterCleanup.localStorage === 'absent';

    this.results.push({
      test: 'Store Cleanup',
      status: success ? '✅ SUCCESS' : '❌ FAILED',
      before: beforeCleanup,
      after: afterCleanup
    });

    console.log('🧹 Test nettoyage:', { beforeCleanup, afterCleanup });
    return { success, beforeCleanup, afterCleanup };
  }

  /**
   * Test d'isolation des données utilisateur
   */
  async testDataIsolation() {
    console.log('🧪 Test: Isolation des données utilisateur');

    // Simuler des données d'un utilisateur précédent
    const oldUserData = {
      cagnottes: [{ id: 'old-1', title: 'Ancienne Cagnotte' }],
      contributions: [{ id: 'old-1', amount: 500 }]
    };

    useCagnotteStore.getState().setCagnottes(oldUserData.cagnottes);

    // Simuler l'arrivée d'un nouvel utilisateur
    localStorage.setItem('isNewUser', 'true');

    // Simuler le chargement du dashboard
    const isNewUser = localStorage.getItem('isNewUser') === 'true';

    if (isNewUser) {
      console.log('🆕 Nouvel utilisateur détecté, nettoyage du store');
      useCagnotteStore.getState().reset();
      localStorage.removeItem('isNewUser');
    }

    const finalState = {
      cagnottesCount: useCagnotteStore.getState().cagnottes.length,
      isNewUserFlag: localStorage.getItem('isNewUser')
    };

    const success = finalState.cagnottesCount === 0 && !finalState.isNewUserFlag;

    this.results.push({
      test: 'Data Isolation',
      status: success ? '✅ SUCCESS' : '❌ FAILED',
      finalState
    });

    console.log('🔒 Test isolation:', finalState);
    return { success, finalState };
  }

  /**
   * Exécuter tous les tests
   */
  async runAllTests() {
    console.log('🚀 Démarrage des tests d\'authentification KOTIZ');

    this.results = [];

    // Test de validation des erreurs (ne nécessite pas de compte réel)
    await this.testErrorValidation();

    // Test de nettoyage du store
    await this.testStoreCleanup();

    // Test d'isolation des données
    await this.testDataIsolation();

    // Afficher le résumé
    this.displayResults();

    return this.results;
  }

  /**
   * Afficher les résultats des tests
   */
  displayResults() {
    console.log('📊 RÉSULTATS DES TESTS D\'AUTHENTIFICATION');
    console.log('='.repeat(50));

    const successCount = this.results.filter(r => r.status.includes('SUCCESS')).length;
    const totalCount = this.results.length;

    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.status}`);
      if (result.error) console.log(`   Erreur: ${result.error}`);
    });

    console.log('='.repeat(50));
    console.log(`✅ Tests réussis: ${successCount}/${totalCount}`);
    console.log(`❌ Tests échoués: ${totalCount - successCount}/${totalCount}`);

    if (successCount === totalCount) {
      console.log('🎉 Tous les tests sont passés !');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.');
    }
  }

  /**
   * Test rapide pour vérifier l'état actuel
   */
  quickCheck() {
    console.log('🔍 Vérification rapide de l\'état');

    const state = {
      currentUser: authService.getCurrentUser()?.email || 'Aucun',
      isAuthenticated: !!authService.getCurrentUser(),
      storeCagnottes: useCagnotteStore.getState().cagnottes.length,
      localStorageKeys: Object.keys(localStorage),
      recaptchaInitialized: !!authService.recaptchaVerifier
    };

    console.log('📋 État actuel:', state);
    return state;
  }
}

// Exporter une instance pour utilisation globale
export const authTester = new AuthTester();

// Fonction utilitaire pour les tests dans la console
window.testAuth = {
  runAll: () => authTester.runAllTests(),
  testEmail: () => authTester.testEmailRegistration(),
  testErrors: () => authTester.testErrorValidation(),
  testCleanup: () => authTester.testStoreCleanup(),
  testIsolation: () => authTester.testDataIsolation(),
  quickCheck: () => authTester.quickCheck(),
  results: () => authTester.results
};

console.log('🧪 Tests d\'authentification disponibles dans window.testAuth');
console.log('Utilisez:');
console.log('- testAuth.runAll() // Tous les tests');
console.log('- testAuth.testEmail() // Test inscription email');
console.log('- testAuth.testErrors() // Test validation erreurs');
console.log('- testAuth.quickCheck() // État actuel');