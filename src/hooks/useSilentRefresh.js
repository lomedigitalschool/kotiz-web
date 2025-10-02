import { useEffect, useRef } from 'react';
import { useCagnotteStore } from '../stores/cagnotteStore';

/**
 * Hook pour gérer le rafraîchissement automatique silencieux des données
 * Rafraîchit les données en arrière-plan sans perturber l'expérience utilisateur
 */
export const useSilentRefresh = (enabled = true, intervalMs = 30000) => {
  const { fetchUserCagnottes, fetchUserContributions, fetchNotifications } = useCagnotteStore();
  const intervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const performSilentRefresh = async () => {
      // Éviter les rafraîchissements simultanés
      if (isRefreshingRef.current) {
        return;
      }

      isRefreshingRef.current = true;

      try {
        // Rafraîchir silencieusement les données sans console.log
        await Promise.allSettled([
          fetchUserCagnottes(),
          fetchUserContributions(),
          fetchNotifications?.()
        ]);
      } catch (error) {
        // Ne pas logger les erreurs pour éviter de perturber l'utilisateur
        console.warn('Silent refresh encountered an error:', error.message);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Démarrer le rafraîchissement automatique
    intervalRef.current = setInterval(performSilentRefresh, intervalMs);

    // Nettoyer l'intervalle
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, fetchUserCagnottes, fetchUserContributions, fetchNotifications]);

  // Fonction pour forcer un rafraîchissement manuel
  const forceRefresh = async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    try {
      await Promise.allSettled([
        fetchUserCagnottes(),
        fetchUserContributions(),
        fetchNotifications?.()
      ]);
    } catch (error) {
      console.warn('Manual refresh encountered an error:', error.message);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  return { forceRefresh, isRefreshing: isRefreshingRef.current };
};