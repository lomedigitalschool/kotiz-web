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
├── pages/          # Pages de l'application
├── services/       # Services API
├── utils/          # Utilitaires
├── App.js          # Composant principal
└── index.js        # Point d'entrée
```

## Fonctionnalités

- Authentification (connexion/inscription)
- Contributions anonymes et authentifiées
- Interface utilisateur responsive

## Technologies utilisées

- React.js
- Vite
- React Router
- Axios
- CSS3

## Licence

MIT