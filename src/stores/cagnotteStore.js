import { create } from "zustand";
import { sendNotification } from "../services/notificationService";
import api, { apiFetch } from "../services/api";


// Fonction pour charger depuis localStorage
const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    return fallback;
  }
};

// Fonction pour générer une clé unique pour une contribution
const generateContributionKey = (contribution) => {
  const date = new Date(contribution.createdAt || contribution.date || Date.now());
  const roundedTime = Math.floor(date.getTime() / 1000); // Arrondi à la seconde
  // Utiliser pullId si cagnotteId n'existe pas (API backend)
  const cagnotteId = contribution.cagnotteId || contribution.pullId;
  return `${cagnotteId}-${contribution.userId || contribution.user || 'anonymous'}-${contribution.amount}-${roundedTime}`;
};

// Fonction pour recalculer les montants des cagnottes basés sur les contributions
const recalculateCagnotteAmounts = (cagnottes, contributions) => {
  const cagnotteAmounts = new Map();
  const cagnotteContributors = new Map();

  // Calculer les montants totaux par cagnotte
  contributions.forEach(contrib => {
    const cagnotteId = contrib.cagnotteId || contrib.pullId;
    if (cagnotteId) {
      // Montant
      const currentAmount = cagnotteAmounts.get(cagnotteId) || 0;
      cagnotteAmounts.set(cagnotteId, currentAmount + parseFloat(contrib.amount) || 0);

      // Contributeurs
      const contributors = cagnotteContributors.get(cagnotteId) || new Set();
      contributors.add(contrib.userId || contrib.user || 'anonymous');
      cagnotteContributors.set(cagnotteId, contributors);
    }
  });

  // Mettre à jour les cagnottes avec les nouveaux montants
  return cagnottes.map(cagnotte => {
    const calculatedAmount = cagnotteAmounts.get(cagnotte.id) || 0;
    const contributorsSet = cagnotteContributors.get(cagnotte.id) || new Set();

    return {
      ...cagnotte,
      currentAmount: calculatedAmount,
      collectedAmount: calculatedAmount,
      contributorsCount: contributorsSet.size,
      contributors: Array.from(contributorsSet)
    };
  });
};

export const useCagnotteStore = create((set, get) => ({
  // état initial
  cagnotte: loadFromStorage("cagnotte", null),
  contributions: loadFromStorage("contributions", []),
  cagnottes: loadFromStorage("cagnottes", []),
  notifications: loadFromStorage("notifications", []),
  loading: false,
  error: null,
  userContributions: [],

  // fonction de nettoyage des données mockées
  cleanMockData: () => {
    try {
      console.log('🧹 [CagnotteStore] Nettoyage des données mockées');

      const contributions = loadFromStorage("contributions", []);
      const cagnottes = loadFromStorage("cagnottes", []);

      console.log('📊 [CagnotteStore] Données avant nettoyage:', {
        contributionsCount: contributions.length,
        cagnottesCount: cagnottes.length
      });

      // Supprimer les contributions mockées (avec "Sylvie" ou données invalides)
      const cleanContributions = contributions.filter(c =>
        c.user !== "Sylvie" &&
        c.cagnotteTitle !== "ANNIVESIAIE" &&
        c.createdAt && !isNaN(new Date(c.createdAt).getTime())
      );

      // Supprimer les cagnottes mockées
      const cleanCagnottes = cagnottes.filter(c =>
        c.title !== "Cagnotte A" &&
        c.title !== "Cagnotte B" &&
        c.title !== "ANNIVESIAIE"
      );

      // Sauvegarder les données nettoyées
      localStorage.setItem("contributions", JSON.stringify(cleanContributions));
      localStorage.setItem("cagnottes", JSON.stringify(cleanCagnottes));

      // Mettre à jour le state
      set({
        contributions: cleanContributions,
        cagnottes: cleanCagnottes
      });

      console.log('✅ [CagnotteStore] Données mockées nettoyées:', {
        cleanContributionsCount: cleanContributions.length,
        cleanCagnottesCount: cleanCagnottes.length
      });
    } catch (error) {
      console.error('❌ [CagnotteStore] Erreur lors du nettoyage:', error);
    }
  },

  // set cagnottes avec suppression des doublons
  setCagnottes: (cagnottes) => {
    const unique = Array.from(new Set(cagnottes.map(c => c.id)))
      .map(id => cagnottes.find(c => c.id === id));

    set({ cagnottes: unique });
    localStorage.setItem("cagnottes", JSON.stringify(unique));
  },

  // récupération toutes cagnottes (pour la page explorer - toutes les cagnottes)
  fetchAllCagnottes: async () => {
    set({ loading: true, error: null });

    try {
      console.log('🌍 Récupération de toutes les cagnottes publiques');
      console.log('🌍 Récupération de toutes les cagnottes publiques');
      // Essayer d'abord de récupérer toutes les cagnottes avec authentification
      let response;
      try {
        response = await api.get('/pulls/all');
        console.log('✅ Toutes les cagnottes récupérées avec authentification');
      } catch (authError) {
        console.log('⚠️ Authentification requise, récupération des cagnottes publiques seulement');
        // Si pas authentifié, récupérer seulement les publiques
        response = await api.get('/pulls/public');
        console.log('✅ Cagnottes publiques récupérées (sans authentification)');
      }

      const result = response.data;
      console.log('📊 Cagnottes récupérées:', result.data?.length || result.length);

      // Extraire les données du résultat (car l'API retourne un objet avec data)
      const data = result.data || result;
      const processedData = Array.isArray(data) ? data.map(c => ({
        ...c,
        currentAmount: parseFloat(c.currentAmount) || 0,
        goalAmount: parseFloat(c.goalAmount) || 0,
        collectedAmount: parseFloat(c.currentAmount) || 0, // Pour la compatibilité
        // Marquer si c'est une cagnotte publique ou privée
        isAccessible: c.type === 'public' || c.userId === undefined // userId undefined = publique
      })) : [];

      set({ cagnottes: processedData, loading: false });
      // Sauvegarder toutes les cagnottes dans localStorage (publiques + privées)
      localStorage.setItem("cagnottes", JSON.stringify(processedData));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cagnottes:', error);
      // Fallback vers localStorage en cas d'erreur (seulement publiques)
      const stored = loadFromStorage("cagnottes", []);
      set({ cagnottes: stored, loading: false, error: error.message });
    }
  },

  // récupération cagnottes de l'utilisateur connecté (pour le dashboard)
  fetchUserCagnottes: async () => {
    // Éviter les appels multiples simultanés
    const currentState = get();
    if (currentState.loading) {
      console.log('🔄 fetchUserCagnottes déjà en cours, ignoré');
      return;
    }

    set({ loading: true, error: null });

    try {
      console.log('🔍 Récupération des cagnottes de l\'utilisateur connecté');

      // Vérifier qu'on a un token valide
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Pas de token - utilisateur non authentifié');
        set({ cagnottes: [], loading: false, error: 'Non authentifié' });
        return;
      }

      // ✅ CORRECTION: Utiliser l'instance API configurée (Axios)
      const response = await api.get('/pulls');
      const data = response.data;
      console.log('✅ Cagnottes utilisateur récupérées:', data.length, 'cagnottes');
      console.log('📊 Données reçues du backend:', data);

      // Debug: afficher le statut de chaque cagnotte
      data.forEach(pull => {
        console.log(`  - ID: ${pull.id}, Titre: ${pull.title}, Statut: ${pull.status}, Type: ${pull.type}`);
      });

      // Traiter les données de base et calculer les montants et contributeurs depuis les contributions incluses
      const processedData = Array.isArray(data) ? data.map(c => {
        // Calculer le montant total collecté depuis les contributions
        const totalCollected = c.contributions?.reduce((sum, contrib) =>
          sum + parseFloat(contrib.amount || 0), 0) || parseFloat(c.currentAmount) || 0;

        // Calculer le nombre de contributeurs uniques
        const contributorsSet = new Set();
        c.contributions?.forEach(contrib => {
          if (contrib.userId) {
            contributorsSet.add(contrib.userId);
          } else if (contrib.user) {
            contributorsSet.add(contrib.user);
          } else if (contrib.contributorName) {
            contributorsSet.add(contrib.contributorName);
          }
        });

        return {
          ...c,
          currentAmount: totalCollected,
          goalAmount: parseFloat(c.goalAmount) || 0,
          collectedAmount: totalCollected, // Pour la compatibilité
          contributorsCount: contributorsSet.size,
          contributors: Array.from(contributorsSet)
        };
      }) : [];

      set({ cagnottes: processedData, loading: false });
      console.log('📊 Cagnottes de l\'utilisateur chargées avec montants et contributeurs calculés depuis l\'API:', processedData.length);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cagnottes utilisateur:', error);
      // Ne pas vider les cagnottes en cas d'erreur pour éviter la disparition des graphiques
      set({ loading: false, error: error.message });
    }
  },

  // récupération cagnotte par id depuis l'API
  fetchCagnotte: async (id) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔍 Récupération de la cagnotte depuis l\'API:', id);
      
      // Appel API pour récupérer la cagnotte mise à jour
      const response = await api.get(`/pulls/${id}`);
      const cagnotteData = response.data.data || response.data;
      
      console.log('✅ Cagnotte récupérée depuis l\'API:', cagnotteData);
      
      // Mettre à jour la cagnotte courante
      set({ cagnotte: cagnotteData, loading: false });
      
      // Sauvegarder dans localStorage
      localStorage.setItem("cagnotte", JSON.stringify(cagnotteData));
      
      return cagnotteData;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la cagnotte:', error);
      
      // Fallback vers le store local
      const allCagnottes = get().cagnottes;
      const selected = allCagnottes.find(c => c.id === id) || null;
      
      set({ cagnotte: selected, loading: false, error: error.message });
      return selected;
    }
  },

  // ajout cagnotte
  addCagnotte: (newCagnotte) => {
    set((state) => {
      // S'assurer que les propriétés sont correctement définies
      const processedCagnotte = {
        ...newCagnotte,
        // Utiliser l'ID de l'API si disponible, sinon générer un mock ID
        id: newCagnotte.id || state.cagnottes.length + 1,
        currentAmount: parseFloat(newCagnotte.currentAmount) || 0,
        goalAmount: parseFloat(newCagnotte.goalAmount) || 0,
        collectedAmount: parseFloat(newCagnotte.currentAmount) || 0, // Pour la compatibilité
        status: newCagnotte.status || 'active', // Les nouvelles cagnottes sont actives
        type: newCagnotte.type || 'public',
        creatorId: newCagnotte.userId || newCagnotte.creatorId || 1, // Support API et mock
      };

      const updatedCagnottes = [...state.cagnottes, processedCagnotte];
      localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));



      console.log('Nouvelle cagnotte ajoutée:', processedCagnotte);

      return { cagnottes: updatedCagnottes };
    });
  },

  // mise à jour cagnotte
  updateCagnotte: (updatedCagnotte) => {
    set((state) => {
      const updatedCagnottes = state.cagnottes.map(c =>
        c.id === updatedCagnotte.id ? updatedCagnotte : c
      );

      localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));

      const currentCagnotte = state.cagnotte?.id === updatedCagnotte.id
        ? updatedCagnotte
        : state.cagnotte;

      localStorage.setItem("cagnotte", JSON.stringify(currentCagnotte));

      return { cagnottes: updatedCagnottes, cagnotte: currentCagnotte };
    });
  },

  // suppression de la cagnotte
  deleteCagnotte: (id) => {
    set((state) => {
      const updatedCagnottes = state.cagnottes.filter(c => c.id !== id);

      const updatedContributions = state.contributions.filter(c => c.cagnotteId !== id);

      localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));
      localStorage.setItem("contributions", JSON.stringify(updatedContributions));

      // si la cagnotte courante est celle qui a ete suprrimé
      if (state.cagnotte?.id === id) {
        localStorage.removeItem("cagnotte");
      }

      // retirer de localCagnottes
      const localSaved = JSON.parse(localStorage.getItem("localCagnottes") || "[]");
      const updatedLocal = localSaved.filter(c => c.id !== id);
      localStorage.setItem("localCagnottes", JSON.stringify(updatedLocal));

      const currentCagnotte = state.cagnotte?.id === id ? null : state.cagnotte;

      return {
        cagnottes: updatedCagnottes,
        contributions: updatedContributions,
        cagnotte: currentCagnotte
      };
    });
  },

  // récup contributions de l'user avec API
  fetchUserContributions: async () => {
    // Éviter les appels multiples simultanés
    const currentState = get();
    if (currentState.loading) {
      console.log('🔄 fetchUserContributions déjà en cours, ignoré');
      return;
    }

    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Pas de token - chargement des contributions locales');
        const stored = loadFromStorage("contributions", []);
        set({ contributions: stored, loading: false });
        return;
      }

      try {
        // Essayer de récupérer depuis l'API
        const response = await api.get('/contributions/my');
        const apiData = response.data;
        const apiContributions = apiData.contributions || apiData.data || apiData || [];
        console.log('✅ Contributions récupérées depuis l\'API:', apiContributions.length, apiContributions);

        // Récupérer les cagnottes pour enrichir les contributions avec les titres
        const currentCagnottes = get().cagnottes;
        const cagnotteMap = new Map(currentCagnottes.map(c => [c.id, c.title]));

        // Enrichir les contributions avec les titres des cagnottes
        const enrichedContributions = apiContributions.map(contrib => ({
          ...contrib,
          // Utiliser pullId si cagnotteId n'existe pas
          cagnotteId: contrib.cagnotteId || contrib.pullId,
          cagnotteTitle: cagnotteMap.get(contrib.cagnotteId || contrib.pullId) || contrib.cagnotteTitle || "Cagnotte inconnue",
          source: 'API' // Marquer la source
        }));

        // Fusionner avec les contributions locales
        const localContributions = loadFromStorage("contributions", []).map(contrib => ({
          ...contrib,
          source: contrib.source || 'LOCAL' // Marquer la source pour les locales
        }));
        const allContributions = [...enrichedContributions, ...localContributions];

        // Utiliser une Map pour dédupliquer par clé unique
        const contributionsMap = new Map();

        allContributions.forEach(contrib => {
          const key = generateContributionKey(contrib);
          if (!contributionsMap.has(key)) {
            contributionsMap.set(key, contrib);
          } else {
            console.log('Doublon détecté et supprimé:', key, contrib);
          }
        });

        const uniqueContributions = Array.from(contributionsMap.values());

        // Éviter les updates inutiles qui causent des re-renders
        set((state) => {
          const hasChanged = JSON.stringify(state.contributions) !== JSON.stringify(uniqueContributions);
          if (!hasChanged) {
            console.log('Aucune modification des contributions, update ignoré');
            return { loading: false }; // Ne changer que loading
          }

          console.log('Contributions mises à jour:', uniqueContributions.length, 'éléments');
          localStorage.setItem("contributions", JSON.stringify(uniqueContributions));

          // Recalculer les montants des cagnottes basés sur les nouvelles contributions
          const updatedCagnottes = recalculateCagnotteAmounts(state.cagnottes, uniqueContributions);
          localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));

          return {
            contributions: uniqueContributions,
            cagnottes: updatedCagnottes,
            loading: false
          };
        });
        return;
      } catch (apiError) {
        console.warn('⚠️ API non disponible, utilisation des données locales:', apiError.message);
      }

      // Fallback vers localStorage
      const stored = loadFromStorage("contributions", []);
      set({ contributions: stored, loading: false });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des contributions:', error);
      const stored = loadFromStorage("contributions", []);
      set({ contributions: stored, loading: false, error: error.message });
    }
  },

  // ajout contribution avec mise à jour complète
  addContribution: (contribution) => {
    set((state) => {
      const cagnotte = state.cagnottes.find(c => c.id === contribution.cagnotteId);

      // Créer la nouvelle contribution avec toutes les informations nécessaires
      const newContribution = {
        ...contribution,
        id: contribution.id || Date.now(),
        cagnotteTitle: cagnotte?.title || "Cagnotte inconnue",
        createdAt: contribution.createdAt || new Date().toISOString(),
        currency: contribution.currency || cagnotte?.currency || 'XOF',
        user: contribution.user || contribution.contributorName || "Anonyme",
        anonymous: contribution.anonymous || false
      };

      // Vérifier les doublons avant d'ajouter
      const newKey = generateContributionKey(newContribution);
      const isDuplicate = state.contributions.some(existing =>
        generateContributionKey(existing) === newKey
      );

      if (isDuplicate) {
        console.log('Contribution déjà existante, ignorée:', newKey);
        return state; // Retourner l'état inchangé
      }

      console.log('Ajout contribution:', newKey, 'Source: LOCAL', newContribution);
      const updatedContributions = [...state.contributions, newContribution];

      // Mettre à jour la cagnotte courante si elle correspond
      const updatedCagnotte = state.cagnotte?.id === contribution.cagnotteId ? {
        ...state.cagnotte,
        currentAmount: (parseFloat(state.cagnotte?.currentAmount) || 0) + parseFloat(contribution.amount),
        contributors: [...(state.cagnotte?.contributors || []), newContribution.user],
      } : state.cagnotte;

      // Mettre à jour la cagnotte dans la liste principale
      const updatedCagnottes = state.cagnottes.map(c => {
        if (c.id === contribution.cagnotteId) {
          const newCurrentAmount = (parseFloat(c.currentAmount) || 0) + parseFloat(contribution.amount);
          const existingContributors = c.contributors || [];
          // Éviter les doublons de contributeurs
          const contributorsList = existingContributors.includes(newContribution.user)
            ? existingContributors
            : [...existingContributors, newContribution.user];

          return {
            ...c,
            currentAmount: newCurrentAmount,
            collectedAmount: newCurrentAmount, // Pour la compatibilité
            contributors: contributorsList,
            contributorsCount: contributorsList.length,
            progressPercentage: c.goalAmount > 0 ? Math.min((newCurrentAmount / parseFloat(c.goalAmount)) * 100, 100) : 0
          };
        }
        return c;
      });

      // Envoyer les notifications
      if (cagnotte) {
        sendNotification({
          userId: cagnotte.creatorId || cagnotte.userId || 1,
          type: "newContribution",
          data: {
            amount: contribution.amount,
            cagnotteTitle: cagnotte.title,
            user: newContribution.user,
            message: contribution.message || "",
          }
        });

        sendNotification({
          userId: contribution.userId || 0,
          type: "paymentResult",
          data: {
            status: "success",
            amount: contribution.amount,
            cagnotteTitle: cagnotte.title,
            receiptLink: `/recu/${Date.now()}`,
            retryLink: `/payer/${cagnotte.id}`
          },
          channels: ["console", "email", "sms"]
        });
      }

      // Recalculer tous les montants pour s'assurer de la cohérence
      const finalCagnottes = recalculateCagnotteAmounts(updatedCagnottes, updatedContributions);

      // Sauvegarder dans localStorage
      localStorage.setItem("contributions", JSON.stringify(updatedContributions));
      if (updatedCagnotte) {
        localStorage.setItem("cagnotte", JSON.stringify(updatedCagnotte));
      }
      localStorage.setItem("cagnottes", JSON.stringify(finalCagnottes));

      console.log(`💰 Contribution ajoutée: ${contribution.amount} FCFA à "${cagnotte?.title}"`);
      console.log(`📊 Nouveau montant collecté: ${updatedCagnottes.find(c => c.id === contribution.cagnotteId)?.currentAmount} FCFA`);
      console.log(`👥 Nombre de contributeurs: ${updatedCagnottes.find(c => c.id === contribution.cagnotteId)?.contributorsCount}`);

      return {
        contributions: updatedContributions,
        cagnotte: updatedCagnotte,
        cagnottes: finalCagnottes
      };
    });
  },

  // Fonction pour forcer le rafraîchissement des données
  refreshAllData: async () => {
    console.log('🔄 [CagnotteStore] Rafraîchissement complet des données');
    
    try {
      await Promise.all([
        get().fetchUserCagnottes(),
        get().fetchUserContributions()
      ]);
      console.log('✅ [CagnotteStore] Données rafraîchies avec succès');
    } catch (error) {
      console.error('❌ [CagnotteStore] Erreur lors du rafraîchissement:', error);
    }
  },

  // récupération des contributions d'une cagnotte spécifique
  fetchCagnotteContributions: async (cagnotteId) => {
    set({ loading: true, error: null });

    try {
      console.log('🔍 Récupération des contributions de la cagnotte:', cagnotteId);

      // Utiliser l'endpoint backend pour récupérer toutes les contributions de la cagnotte
      const response = await api.get(`/pulls/${cagnotteId}/contributions`);
      const contributions = response.data.data || response.data;

      console.log('✅ Contributions de la cagnotte récupérées:', contributions.length);

      // Enrichir les contributions avec les informations des contributeurs
      const enrichedContributions = contributions.map(contrib => ({
        ...contrib,
        // Assurer que cagnotteId est défini
        cagnotteId: contrib.cagnotteId || contrib.pullId || cagnotteId,
        // Utiliser contributor.name si disponible, sinon contributorName
        contributor: contrib.contributor || {
          name: contrib.contributorName || 'Anonyme'
        },
        // Assurer que le montant est un nombre
        amount: parseFloat(contrib.amount) || 0,
        currency: contrib.currency || 'XOF'
      }));

      return enrichedContributions;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des contributions de la cagnotte:', error);
      set({ loading: false, error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // récupération des notifications de l'utilisateur
  fetchNotifications: async () => {
    set({ loading: true, error: null });

    try {
      console.log('🔍 Récupération des notifications utilisateur');

      const response = await api.get('/notifications');
      const notifications = response.data;

      console.log('✅ Notifications récupérées:', notifications.length);

      set({ notifications, loading: false });
      localStorage.setItem("notifications", JSON.stringify(notifications));

      return notifications;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      set({ loading: false, error: error.message });
      return [];
    }
  },

  // marquer une notification comme lue
  markAsRead: async (notificationId) => {
    try {
      console.log('📖 Marquage notification comme lue:', notificationId);

      const response = await api.put(`/notifications/${notificationId}/read`);
      const updatedNotification = response.data.notif;

      // Mettre à jour l'état local
      set((state) => ({
        notifications: state.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true, status: 'read' } : notif
        )
      }));

      // Mettre à jour localStorage
      const currentNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      const updatedNotifications = currentNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true, status: 'read' } : notif
      );
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

      console.log('✅ Notification marquée comme lue');
      return updatedNotification;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      throw error;
    }
  },

  // fonction de reset pour la déconnexion
  reset: () => {
    console.log('🔄 [CagnotteStore] Reset complet du store');

    // Reset immédiat de l'état du store
    set({
      cagnotte: null,
      contributions: [],
      cagnottes: [],
      notifications: [],
      loading: false,
      error: null,
      userContributions: []
    });

    // Supprimer TOUTES les données du localStorage liées aux cagnottes
    const keysToRemove = ['cagnottes', 'contributions', 'cagnotte', 'localCagnottes', 'userContributions', 'notifications'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé: ${key}`);
    });

    console.log('✅ [CagnotteStore] Reset terminé - Isolation des données utilisateur assurée');
  },

}));