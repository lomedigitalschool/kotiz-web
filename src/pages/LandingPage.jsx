// Importation des bibliothèques nécessaires et des composants
import React, { useRef, useState } from "react";
import { FaLock, FaUsers, FaShareAlt, FaBell, FaTools, FaShieldAlt, FaRocket, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import img1 from "../assets/img1.png";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Button from "../components/Button";
import { colors } from '../theme/colors';

// Composant principal de la page d'accueil
const LandingPage = () => {
  const navigate = useNavigate(); // Hook pour naviguer entre les pages
  const featuresRef = useRef(null); // Référence pour faire défiler jusqu'à la section des fonctionnalités
  const howItWorksRef = useRef(null); // Référence pour faire défiler jusqu'à la section "Comment ça marche"
  const [currentFeature, setCurrentFeature] = useState(0); // État pour suivre la fonctionnalité affichée dans le carousel

  // Fonction pour faire défiler jusqu'à une section spécifique
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Liste des fonctionnalités principales affichées sur la page
  const features = [
    { 
      icon: FaRocket, 
      title: "Création rapide", 
      text: "Créez votre cagnotte en quelques clics. Interface intuitive conçue pour une prise en main immédiate.",
      bgColor: "bg-blue-50",
      iconColor: colors.primary
    },
    { 
      icon: FaShieldAlt, 
      title: "Paiement sécurisé", 
      text: "Les contributions sont protégées grâce à notre système fiable. La sécurité financière est cruciale.",
      bgColor: "bg-green-50",
      iconColor: colors.primary,
      featured: true // Indique si cette fonctionnalité est mise en avant
    },
    { 
      icon: FaShareAlt, 
      title: "Partage facile", 
      text: "Partagez le lien via WhatsApp, e-mail ou réseaux sociaux. La collecte gagne en visibilité rapidement.",
      bgColor: "bg-blue-50",
      iconColor: colors.primary
    },
    { 
      icon: FaBell, 
      title: "Notifications", 
      text: "Recevez des alertes quand quelqu'un contribue ou quand la cagnotte approche de son objectif.",
      bgColor: "bg-green-50",
      iconColor: colors.primary
    },
    { 
      icon: FaTools, 
      title: "Gestion flexible", 
      text: "Modifiez la cagnotte, ajoutez des objectifs ou retirez des fonds facilement.",
      bgColor: "bg-blue-50",
      iconColor: colors.primary
    },
    { 
      icon: FaLock, 
      title: "Confidentialité", 
      text: "Vos informations et celles de vos participants restent privées et sécurisées.",
      bgColor: "bg-green-50",
      iconColor: colors.primary
    }
  ];

  // Fonction pour passer à la fonctionnalité suivante dans le carousel
  const nextFeature = () => {
    setCurrentFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  // Fonction pour revenir à la fonctionnalité précédente dans le carousel
  const prevFeature = () => {
    setCurrentFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  return (
    <div className="w-full h-auto flex flex-col bg-white font-sans">
      {/* En-tête de la page */}
      <Header scrollToFeatures={() => scrollToSection(featuresRef)} scrollToHowItWorks={() => scrollToSection(howItWorksRef)} />

      {/* Section Hero principale */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white px-6 pt-28 pb-16">
        {/* Texte principal et bouton d'action */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>
            Créez et gérez vos cagnottes en ligne facilement
          </h2>
          <p className="text-lg md:text-xl mb-6 font-normal" style={{ color: colors.black }}>
            Une solution simple et adaptée à l'Afrique pour collecter de l'argent en toute sécurité.
          </p>
          <Button onClick={() => navigate("/explorePage")} variant="primary">
            Commencer gratuitement
          </Button>
        </div>

        {/* Image Hero */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={img1}
            alt="Créer une cagnotte"
            className="w-[100%] max-w-xl rounded-2xl shadow-xl animate-slowPulse -ml-8"
          />
        </div>
      </section>

      {/* Section fonctionnalités principales avec CAROUSEL AMÉLIORÉ */}
      <section id="features" ref={featuresRef} className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.primary }}>
              Nos fonctionnalités principales
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.black }}>
              Découvrez tous les outils dont vous avez besoin pour créer et gérer vos cagnottes en toute simplicité
            </p>
          </div>

          {/* Carousel Container amélioré */}
          <div className="relative">
            {/* Flèches de navigation */}
            <button 
              onClick={prevFeature}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              style={{ backgroundColor: colors.primary, color: 'white' }}
              aria-label="Fonctionnalité précédente"
            >
              <FaChevronLeft className="text-lg" />
            </button>
            
            <button 
              onClick={nextFeature}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              style={{ backgroundColor: colors.primary, color: 'white' }}
              aria-label="Fonctionnalité suivante"
            >
              <FaChevronRight className="text-lg" />
            </button>

            {/* Contenu du carousel */}
            <div className="overflow-hidden px-12">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentFeature * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div
                    key={index} 
                    className="flex-shrink-0 w-full px-4 flex justify-center"
                  >
                    <div className={`p-8 h-96 w-full max-w-md rounded-3xl  flex flex-col ${feature.bgColor} ${feature.featured ? 'ring-4 ring-green-300 ring-opacity-50' : ''}`}>
                      {/* Icone en haut */}
                      <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl" style={{ backgroundColor: feature.iconColor + '20' }}>
                          <feature.icon className="text-3xl" style={{ color: feature.iconColor }} />
                        </div>
                      </div>
                      
                      {/* Titre */}
                      <h3 className="font-bold text-2xl text-center mb-4" style={{ color: colors.black }}>
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-base leading-relaxed text-center flex-grow" style={{ color: colors.black }}>
                        {feature.text}
                      </p>
                      
                      {/* Badge populaire */}
                      {feature.featured && (
                        <div className="mt-6 flex justify-center">
                          <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: colors.primary, color: 'white' }}>
                            Fonctionnalité populaire
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateurs */}
            <div className="flex justify-center mt-10 space-x-3">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${index === currentFeature ? 'scale-125' : 'scale-100'}`}
                  style={{ 
                    backgroundColor: index === currentFeature ? colors.primary : colors.secondary,
                    opacity: index === currentFeature ? 1 : 0.4
                  }}
                  aria-label={`Aller à la fonctionnalité ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="how" ref={howItWorksRef} className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.primary }}>
          Comment ça marche ?
        </h2>

        {/* Étapes */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-6xl mx-auto px-4">
          {{
            "Créez votre cagnotte en quelques clics",
            "Partagez le lien avec vos proches",
            "Recevez les contributions en toute sécurité"
          }.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1 px-6 py-8 rounded-xl shadow bg-white min-h-[180px] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: colors.secondary }}>
                <p className="font-bold text-xl text-white">{index + 1}</p>
              </div>
              <p className="text-base font-medium text-center" style={{ color: colors.primary }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section finale */}
      <section className="bg-[#f7f9fc] flex flex-col justify-center items-center text-center py-20 px-4">
        <h2 className="text-3xl font-bold mb-8" style={{ color: colors.primary }}>
          Créez vos cagnottes en ligne facilement
        </h2>
        <p className="text-lg font-medium text-gray-600 max-w-xl mb-6" style={{ color: colors.black }}>
          Kotiz vous permet de collecter de l'argent en toute sécurité pour vos projets, événements et causes qui vous tiennent à cœur.
        </p>
        <Button onClick={() => navigate("/create-cagnotte")} variant="primary">
          Créer une cagnotte
        </Button>
      </section>

      {/* Footer avec logo horizontal */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto flex justify-center items-center">
          <img
            src="/src/assets/logos/logo_horizontale.png"
            alt="Logo horizontal"
            className="w-32 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Retour en haut de la page
          />
          <p className="text-sm text-gray-600">© 2025 KOTIZ. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
