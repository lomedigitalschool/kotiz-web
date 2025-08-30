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

export default api;