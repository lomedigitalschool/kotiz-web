// Service API pour les endpoints publics (sans authentification)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const publicApi = {
  // Récupérer une cagnotte publique par ID
  getCagnotte: async (id) => {
    const response = await fetch(`${API_BASE_URL}/pulls/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Récupérer les contributions d'une cagnotte
  getContributions: async (id) => {
    const response = await fetch(`${API_BASE_URL}/pulls/${id}/contributions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Récupérer toutes les cagnottes publiques
  getPublicCagnottes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/pulls/public${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

export default publicApi;