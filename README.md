# Kotiz Web

Frontend de l'application Kotiz développée par Lome Digital School - Plateforme de cagnottes collaboratives avec vérification d'identité sécurisée.

## 🚀 Fonctionnalités

### Interface utilisateur moderne
- Interface responsive avec Tailwind CSS
- Navigation intuitive avec React Router
- Composants réutilisables et modulaires
- Gestion d'état avec Zustand

### Système d'authentification complet
- Inscription et connexion utilisateur avec validation
- Gestion des sessions avec JWT
- Protection des routes privées
- Messages de succès lors de l'inscription
- Gestion des erreurs d'authentification

### Gestion avancée des cagnottes
- Création de cagnottes avec upload d'images (multer)
- Modification complète des cagnottes existantes
- Exploration et filtrage des cagnottes publiques
- Contributions avec messages personnalisés
- Suivi en temps réel des objectifs et montants
- Synchronisation automatique après modifications
- Gestion des statuts (actif, en attente, clôturé)

### Système KYC intégré
- Soumission de documents d'identité
- Suivi du statut de vérification
- Interface pour les resoumissions
- Gestion multi-soumissions

### Profil utilisateur dynamique
- Informations personnelles récupérées depuis l'API
- Historique des contributions réelles
- Liste des cagnottes créées par l'utilisateur
- Tableau de bord avec statistiques calculées
- Gestion de la déconnexion sécurisée

### Dashboard interactif
- Statistiques en temps réel (montants, cagnottes actives, contributeurs)
- Graphiques avec Recharts (barres et camemberts)
- Liste des cagnottes avec progression visuelle
- Historique des contributions paginé
- Calcul automatique des métriques

## 📋 Installation

### Prérequis
- Node.js (v16+)
- npm ou yarn
- Backend Kotiz en cours d'exécution

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/lomedigitalschool/kotiz-web.git
cd kotiz-web
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Configurer le fichier `.env` :
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Kotiz
VITE_APP_VERSION=1.0.0
```

4. **Lancer l'application**
```bash
# Développement (port 3000)
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

### Architecture des services

- **Frontend** : `http://localhost:3000` (Vite + React)
- **Backend API** : `http://localhost:5000/api/v1` (Express + PostgreSQL)
- **Admin Panel** : `http://localhost:5000/admin` (AdminJS)
- **Base de données** : PostgreSQL

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── components/          # Composants réutilisables
│   ├── Header.jsx      # En-tête principal avec navigation
│   ├── Header1.jsx     # En-tête alternatif
│   └── Button.jsx      # Bouton réutilisable avec styles personnalisés
├── pages/              # Pages de l'application
│   ├── LandingPage.jsx # Page d'accueil principale
│   ├── Register.jsx    # Page d'inscription des utilisateurs
│   ├── Login.jsx       # Page de connexion
│   ├── Dashboard.jsx   # Tableau de bord utilisateur
│   ├── explorePage.jsx # Page pour explorer et filtrer les cagnottes
│   ├── createCagnotte.jsx # Page de création de cagnotte
│   ├── CagnotteDetails.jsx # Détails d'une cagnotte
│   ├── ContributePage.jsx # Page de contribution
│   ├── ContributorsPage.jsx # Liste des contributeurs
│   ├── EditCagnotte.jsx # Modification de cagnotte
│   └── profilPage.jsx  # Page de profil utilisateur
├── services/           # Services API
│   ├── api.js         # Configuration Axios et intercepteurs
│   └── auth.js        # Services d'authentification
├── stores/            # Gestion d'état
│   └── cagnotteStore.js # Store pour les cagnottes
├── theme/             # Thèmes et styles globaux
│   └── colors.js      # Définition des couleurs principales
├── assets/            # Ressources statiques
│   ├── img1.png, img2.png, img3.png # Images d'illustration
│   ├── logo.png       # Logo principal
│   ├── illustrations/ # Illustrations diverses
│   └── logos/         # Variantes du logo
├── App.jsx            # Composant principal avec routage
├── main.jsx           # Point d'entrée React
├── index.css          # Styles globaux
└── global.css         # Styles Tailwind personnalisés
```

### Composants principaux

#### Pages d'authentification
- **Register.jsx** : Formulaire d'inscription avec validation
- **Login.jsx** : Formulaire de connexion avec gestion d'erreurs

#### Pages de cagnottes
- **createCagnotte.jsx** : Création avec upload d'image et KYC
- **CagnotteDetails.jsx** : Affichage détaillé avec contributions
- **explorePage.jsx** : Liste avec filtres et recherche

#### Services API
- **api.js** : Configuration centralisée des appels API
- **auth.js** : Gestion de l'authentification et des tokens

## 🔌 Intégration Backend

### Configuration API
L'application communique avec le backend Kotiz via les endpoints suivants :

#### Authentication
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/me` - Profil utilisateur

#### Cagnottes (Pulls)
- `POST /pulls` - Créer une cagnotte avec upload d'image
- `GET /pulls` - Lister toutes les cagnottes
- `GET /pulls/:id` - Détails d'une cagnotte avec contributions
- `PUT /pulls/:id` - Modifier une cagnotte existante
- `DELETE /pulls/:id` - Supprimer une cagnotte

#### Fichiers et médias
- `GET /uploads/:filename` - Accès aux images uploadées
- Support des formats : JPEG, PNG (max 5MB)

#### KYC
- `POST /kyc/submit` - Soumettre documents KYC
- `GET /kyc/status` - Statut de vérification
- `GET /kyc/history` - Historique des soumissions

#### Contributions
- `POST /contributions` - Faire une contribution
- `GET /contributions/my` - Mes contributions

### Gestion des erreurs
- Intercepteurs Axios pour les erreurs HTTP
- Messages d'erreur utilisateur-friendly
- Redirection automatique en cas d'expiration de session

## 🎨 Design System

### Couleurs principales
Définies dans `src/theme/colors.js` :
```javascript
export const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  neutral: '#6B7280',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B'
}
```

### Composants réutilisables
- **Button.jsx** : Boutons avec variantes (primary, secondary, outline)
- **Header.jsx** : Navigation responsive avec menu mobile
- Formulaires avec validation intégrée

## 🔐 Sécurité

### Authentification
- Stockage sécurisé des tokens JWT
- Protection des routes privées
- Déconnexion automatique en cas d'expiration

### Validation des données
- Validation côté client avec React Hook Form
- Sanitisation des entrées utilisateur
- Upload sécurisé des fichiers

## 🛠️ Développement

### Scripts disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Linting du code
```

### Technologies utilisées
- **React 18** - Framework frontend avec hooks
- **Vite** - Build tool et serveur de développement rapide
- **React Router v6** - Routage côté client avancé
- **Axios** - Client HTTP avec intercepteurs
- **Tailwind CSS** - Framework CSS utilitaire
- **Zustand** - Gestion d'état légère et performante
- **React QR Code** - Génération de QR codes
- **Recharts** - Bibliothèque de graphiques interactifs
- **UUID** - Génération d'identifiants uniques
- **React Icons** - Collection d'icônes

### Variables d'environnement
```env
# API Backend (port 5000 pour le backend)
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Configuration de l'application
VITE_APP_NAME=Kotiz
VITE_APP_VERSION=1.0.0

# Upload de fichiers
VITE_MAX_FILE_SIZE=5242880  # 5MB
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

### Architecture des services
- **Frontend** : `http://localhost:3000` (Vite + React)
- **Backend API** : `http://localhost:5000/api/v1` (Express + PostgreSQL)
- **Admin Panel** : `http://localhost:5000/admin` (AdminJS)
- **Base de données** : PostgreSQL
- **Uploads** : `http://localhost:5000/uploads/` (fichiers statiques)

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Déploiement sur Netlify
```bash
# Build
npm run build

# Déployer le dossier dist/
```

### Variables d'environnement en production
Configurer les variables suivantes sur votre plateforme de déploiement :
- `VITE_API_BASE_URL` : URL de votre API backend en production
- `VITE_APP_NAME` : Nom de l'application
- `VITE_APP_VERSION` : Version de l'application

## 🧪 Tests

### Tests manuels
1. **Inscription** : Créer un compte utilisateur avec message de succès
2. **Connexion** : Se connecter avec les identifiants
3. **Création de cagnotte** : Créer une nouvelle cagnotte avec image (multer)
4. **Modification de cagnotte** : Modifier une cagnotte existante avec synchronisation
5. **Détails de cagnotte** : Voir les détails avec contributions et QR code
6. **Contribution** : Contribuer à une cagnotte avec message personnalisé
7. **Dashboard** : Voir les statistiques et graphiques en temps réel
8. **Profil utilisateur** : Consulter les informations réelles et l'historique
9. **KYC** : Soumettre des documents d'identité
10. **Déconnexion** : Se déconnecter avec nettoyage des données

### Collection Postman
Utilisez la collection Postman du backend (`Kotiz_API_Collection.postman_collection.json`) pour tester les endpoints API.

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- **Desktop** : Expérience complète avec sidebar
- **Tablet** : Navigation adaptée et layout flexible
- **Mobile** : Interface tactile optimisée avec menu hamburger

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- Utiliser ESLint pour la cohérence du code
- Nommer les composants en PascalCase
- Utiliser des hooks personnalisés pour la logique réutilisable
- Commenter les fonctions complexes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé par **Lome Digital School**

- 📧 Contact : contact@lomedigitalschool.com
- 🌐 Site web : https://lomedigitalschool.com

## ✨ Nouvelles fonctionnalités développées

### Session de développement actuelle

#### 🔧 Corrections et améliorations apportées

1. **Messages de succès lors de l'inscription**
   - Ajout de notifications de succès après inscription réussie
   - Amélioration de la gestion des erreurs d'inscription

2. **Système d'upload d'images complet**
   - Configuration de Multer côté backend
   - Gestion des fichiers statiques
   - Validation des types et tailles de fichiers
   - Stockage sécurisé dans le dossier `uploads/`

3. **Modification de cagnottes avec synchronisation**
   - Remplacement des simulations par de vrais appels API
   - Synchronisation automatique après modification
   - Détection des modifications et rechargement des données
   - Gestion des états de navigation

4. **Page de profil dynamique**
   - Remplacement des données statiques par des données réelles
   - Récupération des informations utilisateur depuis l'API
   - Affichage des cagnottes créées et contributions
   - Gestion de l'authentification et déconnexion sécurisée

5. **Dashboard interactif avec graphiques**
   - Statistiques calculées en temps réel
   - Graphiques avec Recharts (barres et camemberts)
   - Gestion des erreurs de données (undefined/null)
   - Interface responsive et moderne

6. **Corrections d'URLs API**
   - Mise à jour de tous les endpoints pour utiliser `/v1/pulls/`
   - Correction des URLs dans toutes les pages
   - Synchronisation frontend/backend

7. **Amélioration de la gestion d'état**
   - Utilisation correcte du store Zustand
   - Synchronisation des données entre composants
   - Gestion des chargements et erreurs

#### 🏗️ Architecture technique mise à jour

- **Frontend** : `http://localhost:3000` (Vite + React)
- **Backend** : `http://localhost:5000` (Express + PostgreSQL)
- **Admin Panel** : `http://localhost:5000/admin` (AdminJS)
- **Uploads** : `http://localhost:5000/uploads/` (fichiers statiques)

#### 📊 Fonctionnalités opérationnelles

- ✅ Inscription avec messages de succès
- ✅ Création de cagnottes avec upload d'images
- ✅ Modification de cagnottes avec synchronisation
- ✅ Consultation des détails de cagnottes
- ✅ Contributions avec messages personnalisés
- ✅ Dashboard avec statistiques et graphiques
- ✅ Profil utilisateur avec données réelles
- ✅ Gestion complète de l'authentification

## 🔗 Liens utiles

- [Backend Kotiz](../kotiz-back-init) - API backend
- [Documentation API](../kotiz-back-init/README.md) - Documentation complète de l'API
- [Collection Postman](../kotiz-back-init/Kotiz_API_Collection.postman_collection.json) - Tests API mis à jour

---

**Kotiz Web** - Interface moderne et complète pour la plateforme de cagnottes collaboratives avec vérification d'identité sécurisée.