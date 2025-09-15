import { create } from "zustand";
import { sendNotification } from "../services/notificationService";
import { apiFetch } from "../services/api";


// Fonction  pour charger depuis localStorage
const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    return fallback;
  }

};

export const useCagnotteStore = create((set, get) => ({
  // état initial
  cagnotte: loadFromStorage("cagnotte", null),
  contributions: loadFromStorage("contributions", []),
  cagnottes: loadFromStorage("cagnottes", []),
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
        response = await apiFetch(`http://localhost:5000/api/v1/pulls/all`);
        console.log('✅ Toutes les cagnottes récupérées avec authentification');
      } catch (authError) {
        console.log('⚠️ Authentification requise, récupération des cagnottes publiques seulement');
        // Si pas authentifié, récupérer seulement les publiques
        response = await apiFetch(`http://localhost:5000/api/v1/pulls/public`);
        console.log('✅ Cagnottes publiques récupérées (sans authentification)');
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
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
      
      // ✅ CORRECTION: Utiliser l'URL correcte du backend
      const response = await apiFetch(`http://localhost:5000/api/v1/pulls`);

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ Token expiré - nettoyage nécessaire');
          localStorage.removeItem('token');
          set({ cagnottes: [], loading: false, error: 'Session expirée' });
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cagnottes utilisateur récupérées:', data.length, 'cagnottes');
      console.log('📊 Données reçues du backend:', data);

      // S'assurer que chaque cagnotte a les bonnes propriétés
      const processedData = Array.isArray(data) ? data.map(c => ({
        ...c,
        currentAmount: parseFloat(c.currentAmount) || 0,
        goalAmount: parseFloat(c.goalAmount) || 0,
        collectedAmount: parseFloat(c.currentAmount) || 0 // Pour la compatibilité
      })) : [];

      set({ cagnottes: processedData, loading: false });
      console.log('📊 Cagnottes de l\'utilisateur chargées:', processedData.length);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cagnottes utilisateur:', error);
      set({ cagnottes: [], loading: false, error: error.message });
    }
  },

  // récupération cagnotte par id
  fetchCagnotte: (id) => {
    const allCagnottes = get().cagnottes;
    const selected = allCagnottes.find(c => c.id === id) || null;

    const savedContributions = loadFromStorage("contributions", []);
    const filteredContributions = savedContributions.filter(c => c.cagnotteId === id);

    set({ cagnotte: selected, contributions: filteredContributions });
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

  // récup contributions de l'user
  fetchUserContributions: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, error: 'Utilisateur non authentifié' });
        return;
      }

      // Récupérer les contributions depuis localStorage (elles sont stockées localement)
      const allContributions = loadFromStorage("contributions", []);
      const userContributions = allContributions.filter(c => c.userId);
      set({ contributions: userContributions, loading: false });
      localStorage.setItem("contributions", JSON.stringify(userContributions));
    } catch (error) {
      console.error('Erreur lors de la récupération des contributions:', error);
      const stored = loadFromStorage("contributions", []);
      set({ contributions: stored, loading: false, error: error.message });
    }
  },

  // ajout contribution
  addContribution: (contribution) => {
    set((state) => {
      const cagnotte = state.cagnottes.find(c => c.id === contribution.cagnotteId);

      const updatedContributions = [
        ...state.contributions,
        {
          ...contribution,
          cagnotteTitle: cagnotte?.title || "Cagnotte inconnue"
        }
      ];

      // Mettre à jour la cagnotte courante si elle correspond
      const updatedCagnotte = state.cagnotte?.id === contribution.cagnotteId ? {
        ...state.cagnotte,
        currentAmount: (parseFloat(state.cagnotte?.currentAmount) || 0) + parseFloat(contribution.amount),
        contributors: [...(state.cagnotte?.contributors || []), contribution.user || "Anonyme"],
      } : state.cagnotte;

      // Mettre à jour la cagnotte dans la liste principale (pour Explorer)
      const updatedCagnottes = state.cagnottes.map(c => {
        if (c.id === contribution.cagnotteId) {
          const newCurrentAmount = (parseFloat(c.currentAmount) || 0) + parseFloat(contribution.amount);
          return {
            ...c,
            currentAmount: newCurrentAmount,
            contributors: [...(c.contributors || []), contribution.user || "Anonyme"],
            // Recalculer le pourcentage pour les tests
            progressPercentage: c.goalAmount > 0 ? Math.min((newCurrentAmount / parseFloat(c.goalAmount)) * 100, 100) : 0
          };
        }
        return c;
      });

      // Envoyer les notifications
      if (cagnotte) {
        sendNotification({
          userId: cagnotte.creatorId || 1,
          type: "newContribution",
          data: {
            amount: contribution.amount,
            cagnotteTitle: cagnotte.title,
            user: contribution.user || "Anonyme",
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

      // Sauvegarder dans localStorage
      localStorage.setItem("contributions", JSON.stringify(updatedContributions));
      if (updatedCagnotte) {
        localStorage.setItem("cagnotte", JSON.stringify(updatedCagnotte));
      }
      localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));

      console.log(`💰 Contribution ajoutée: ${contribution.amount} à cagnotte ${contribution.cagnotteId}`);
      console.log(`📊 Nouveau montant: ${updatedCagnottes.find(c => c.id === contribution.cagnotteId)?.currentAmount}`);

      return {
        contributions: updatedContributions,
        cagnotte: updatedCagnotte,
        cagnottes: updatedCagnottes
      };
    });
  },

  // fonction de reset pour la déconnexion
  reset: () => {
    console.log('🔄 [CagnotteStore] Reset complet du store');

    // Reset immédiat de l'état du store
    set({
      cagnotte: null,
      contributions: [],
      cagnottes: [],
      loading: false,
      error: null,
      userContributions: []
    });

    // Supprimer TOUTES les données du localStorage liées aux cagnottes
    const keysToRemove = ['cagnottes', 'contributions', 'cagnotte', 'localCagnottes', 'userContributions'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé: ${key}`);
    });

    console.log('✅ [CagnotteStore] Reset terminé - Isolation des données utilisateur assurée');
  },

}));