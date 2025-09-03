import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL de votre backend
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs de réponse (notamment 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');

            // Rediriger vers la page de connexion
            if (window.location.pathname !== '/login') {
                alert('Votre session a expiré. Veuillez vous reconnecter.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;