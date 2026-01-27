import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCogs, FaQuestionCircle, FaSearch, FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

import Button from "./Button";
import logo from "../assets/logos/logo_horizontale.png";

const Header = ({ scrollToFeatures, scrollToHowItWorks, showAuthButtons = false }) => {
   const navigate = useNavigate();
   const { user, isAuthenticated, logout } = useAuth();
   const [isOpen, setIsOpen] = useState(false);
   const [showProfileMenu, setShowProfileMenu] = useState(false);
   const profileMenuRef = useRef(null);

  // Fermer le menu profil lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    {
      label: "Fonctionnalités",
      icon: <FaCogs className="text-lg text-green-200 opacity-60" />,
      onClick: scrollToFeatures,
    },
    {
      label: "Comment ça marche ?",
      icon: <FaQuestionCircle className="text-lg text-green-200 opacity-60" />,
      onClick: scrollToHowItWorks,
    },
    {
      label: "Explorer",
      icon: <FaSearch className="text-lg text-green-200 opacity-60" />,
      onClick: () => navigate("/explorePage"),
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md z-50">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo Kotiz"
        className="w-32 md:w-40 cursor-pointer"
        onClick={() => navigate("/landing")}
      />

      {/* Navigation Desktop */}
      <nav className="hidden md:flex flex-1 mx-20">
        <ul className="flex justify-between w-full font-medium">
          {navLinks.map(({ label, icon, onClick }) => (
            <li key={label}>
              <button
                onClick={onClick}
                className="flex items-center gap-2 text-black hover:text-[#4ca260] transition-colors duration-300 font-semibold"
              >
                {icon} {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu Mobile Toggle */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation Mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden">
          <ul className="flex flex-col py-4">
            {navLinks.map(({ label, icon, onClick }) => (
              <li key={label} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => {
                    onClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-6 py-3 text-left text-black hover:text-[#4ca260] transition-colors duration-300 font-semibold"
                >
                  {icon} {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Boutons d'authentification / Profil */}
      <div className="hidden md:flex items-center gap-4">
        {!(isAuthenticated && user) && showAuthButtons ? (
          <>
            <Button
              onClick={() => navigate("/login")}
              className="text-[#4ca260] border border-[#4ca260] hover:bg-[#4ca260] hover:text-white"
            >
              Se connecter
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-[#4ca260] text-white hover:bg-[#3a8a4a]"
            >
              S'inscrire
            </Button>
          </>
        ) : null}
        {isAuthenticated && user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center text-black hover:text-[#4ca260] transition-colors duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-[#4ca260] flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
            </button>

            {/* Menu déroulant profil */}
            {showProfileMenu && (
              <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                <li>
                  <button
                    onClick={() => {
                      navigate("/profil");
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-t-lg"
                    style={{ color: '#3B5BAB' }}
                  >
                    <FaUser style={{ color: '#3B5BAB' }} /> Accès à mon compte
                  </button>
                </li>
                <li>
                  <button
                    onClick={async () => {
                      try {
                        const { logout: firebaseLogout } = await import('../services/auth');
                        await firebaseLogout();
                        logout();
                        setShowProfileMenu(false);
                        navigate("/login");
                      } catch (error) {
                        console.error('Erreur lors de la déconnexion:', error);
                        logout();
                        setShowProfileMenu(false);
                        navigate("/login");
                      }
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-b-lg"
                    style={{ color: '#dc2626' }}
                  >
                    <FaSignOutAlt style={{ color: '#dc2626' }} /> Déconnexion
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
