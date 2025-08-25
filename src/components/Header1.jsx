// Importation des bibliothèques nécessaires
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

// Composant Header1 : barre de navigation alternative de explorePage
const Header = ({ scrollToFeatures, scrollToHowItWorks }) => {
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow-md z-50">
      {/* Logo horizontal de l'application */}
      <img
        src="/src/assets/logos/logo_horizontale.png"
        alt="Logo horizontal"
        className="w-40 cursor-pointer"
        onClick={() => navigate('/landing')} // Redirection vers la page d'accueil
      />

      {/* Navigation principale */}
      <nav className="hidden md:flex mx-4">
        <ul className="flex gap-6 font-medium">
          <li>
            {/* Bouton pour naviguer vers la page d'accueil */}
            <button 
              onClick={() => navigate('/landing')}
              className="text-[#000000] hover:text-[#4ca260] transition-colors duration-300 font-semibold"
            >
              Accueil
            </button>
          </li>
          <li>
            {/* Bouton pour naviguer vers la page d'exploration */}
            <button 
              onClick={() => navigate('/profil')}
              className="text-[#000000] hover:text-[#4ca260] transition-colors duration-300 font-semibold"
            >
              Profil
            </button>
          </li>
        </ul>
      </nav>

      {/* Actions utilisateur */}
      <div className="flex gap-3 md:gap-4 items-center">
        {/* Bouton pour se connecter */}
        <Button 
          onClick={() => navigate('/login')} 
          variant="tertiary"
          className="text-sm md:text-base py-3 px-6"
        >
          Se connecter
        </Button>
        {/* Bouton pour créer une cagnotte */}
        <Button 
          onClick={() => navigate('/create-cagnotte')} 
          variant="primary"
          className="text-sm md:text-base py-3 px-6"
        >
          Créer une cagnotte
        </Button>
      </div>
    </header>
  );
};

export default Header;