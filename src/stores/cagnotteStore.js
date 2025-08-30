import { create } from "zustand";

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

  // set cagnottes avec suppression des doublons
  setCagnottes: (cagnottes) => {
    const unique = Array.from(new Set(cagnottes.map(c => c.id)))
      .map(id => cagnottes.find(c => c.id === id));

    set({ cagnottes: unique });
    localStorage.setItem("cagnottes", JSON.stringify(unique));
  },

  // récupération toutes cagnottes
  fetchAllCagnottes: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, error: 'Utilisateur non authentifié' });
        return;
      }

      const response = await fetch('http://localhost:5000/api/v1/pulls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cagnottes récupérées:', data);

      // S'assurer que chaque cagnotte a les bonnes propriétés
      const processedData = Array.isArray(data) ? data.map(c => ({
        ...c,
        currentAmount: c.currentAmount || 0,
        goalAmount: c.goalAmount || 0,
        collectedAmount: c.currentAmount || 0 // Pour la compatibilité
      })) : [];

      set({ cagnottes: processedData, loading: false });
      localStorage.setItem("cagnottes", JSON.stringify(processedData));
    } catch (error) {
      console.error('Erreur lors de la récupération des cagnottes:', error);
      // Fallback vers localStorage en cas d'erreur
      const stored = loadFromStorage("cagnottes", []);
      set({ cagnottes: stored, loading: false, error: error.message });
    }
  },

  // récupération cagnotte par id

  fetchCagnotte: (id) => {
    const allCagnottes = get().cagnottes;
    const selected = allCagnottes.find(c => c.id === id) || null;

    const savedContributions = loadFromStorage("contributions", []);
    const filteredContributions = savedContributions.filter(c => c.cagnotteId === id);

    set({ cagnotte: selected, contributions: filteredContributions } );

  },

  // ajout cagnotte
  addCagnotte: (newCagnotte) => {
    set((state) => {
      // S'assurer que les propriétés sont correctement définies
      const processedCagnotte = {
        ...newCagnotte,
        currentAmount: newCagnotte.currentAmount || 0,
        goalAmount: newCagnotte.goalAmount || 0,
        collectedAmount: newCagnotte.currentAmount || 0, // Pour la compatibilité
        status: newCagnotte.status || 'active', // Les nouvelles cagnottes sont actives
        type: newCagnotte.type || 'public'
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

      // Pour l'instant, on utilise les données locales car l'endpoint contributions n'existe pas encore
      // TODO: Remplacer par un appel API réel quand l'endpoint sera disponible
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

      const updatedCagnotte = {
        ...state.cagnotte,
        currentAmount: (state.cagnotte?.currentAmount || 0) + contribution.amount,
        contributors: [...(state.cagnotte?.contributors || []), contribution.user || "Anonyme"],
      };

      const updatedCagnottes = state.cagnottes.map(c =>
        c.id === updatedCagnotte.id ? updatedCagnotte : c
      );

      localStorage.setItem("contributions", JSON.stringify(updatedContributions));
      localStorage.setItem("cagnotte", JSON.stringify(updatedCagnotte));
      localStorage.setItem("cagnottes", JSON.stringify(updatedCagnottes));

      return { 
        contributions: updatedContributions, 
        cagnotte: updatedCagnotte, 
        cagnottes: updatedCagnottes 
      };
    });
  },

}
)

);


