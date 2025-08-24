# Kotiz Web

Frontend de l'application Kotiz développée par Lome Digital School.

## Installation

1. Cloner le repository
```bash
git clone https://github.com/lomedigitalschool/kotiz-web.git
cd kotiz-web
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

4. Lancer l'application
```bash
npm run dev
```

## Structure du projet

```
src/
├── components/      # Composants réutilisables
│   ├── Header.jsx   # En-tête principal avec navigation
│   ├── Button.jsx   # Bouton réutilisable avec styles personnalisés
├── pages/           # Pages de l'application
│   ├── explorePage.jsx # Page pour explorer et filtrer les campagnes
│   ├── LandingPage.jsx # Page d'accueil principale
│   ├── Register.jsx    # Page d'inscription des utilisateurs
├── theme/           # Thèmes et styles globaux
│   ├── colors.js    # Définition des couleurs principales de l'application
├── services/        # Services API
├── utils/           # Utilitaires
├── App.js           # Composant principal
└── index.js         # Point d'entrée
```

## Fonctionnalités

- **Navigation** : Le composant `Header.jsx` fournit une barre de navigation avec des liens vers les sections principales.
- **Exploration des campagnes** : La page `explorePage.jsx` permet de rechercher, filtrer et trier les campagnes.
- **Thème cohérent** : Les couleurs principales sont définies dans `theme/colors.js` pour garantir une cohérence visuelle.

## Technologies utilisées

- React.js
- Vite
- React Router
- Axios
- CSS3

## Licence

MIT