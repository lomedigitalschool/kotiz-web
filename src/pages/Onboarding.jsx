import React, { useState } from "react"; 
import img1 from "../assets/img1.png";  
import img2 from "../assets/img2.png";  
import img3 from "../assets/img3.png";  

// la fonction à appeler lorsque l'utilisateur termine l'onboarding
const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(1); 

  const pages = [
    {
      image: img1, 
      title: "Lancez votre cotisation", 
      description:
        "Créez votre cotisation en quelques secondes pour un projet, un événement ou une cause.",
    },
    {
      image: img2, 
      title: "Contribuez en un clic", 
      description:
        "Partagez le lien et vos proches peuvent participer sans créer de compte, en toute simplicité.", 
    },
    {
      image: img3, 
      title: "Suivi instantané et très facile", 
      description:
        "Suivez l’évolution de votre cotisation en temps réel et gérez vos fonds en toute simplicité.", 
    },
  ];

  // la fonction pour naviguer vers l'écran d'accueil
  const navigateToHome = () => {
    if (onFinish) {
      onFinish(); 
    } else if (typeof window !== "undefined") {
      window.location.href = "/screenhome"; 
    }
  };

  // la fonction pour passer à l'étape suivante ou pourterminer l'onboarding
  const handleNext = () => {
    if (step < pages.length) {
      setStep((s) => s + 1); 
    } else {
      navigateToHome(); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans p-6">
      <div className="flex-1 flex flex-col items-center text-center">
        <div className="w-full max-w-6xl mt-2 flex justify-center">
          <img
            src={pages[step - 1].image} 
            alt={pages[step - 1].title} 
            className="w-[80%] h-80 md:h-80 object-cover rounded-2xl shadow-lg animate-pulse-slow" 
          />
        </div>

        <h2 className="text-secondary font-bold mt-4 text-2xl md:text-3xl">
          {pages[step - 1].title} 
        </h2>

        <p className="text-primary text-base md:text-lg mt-2 px-4 leading-relaxed max-w-2xl">
          {pages[step - 1].description} 
        </p>

        <div className="w-full max-w-md mt-6 flex gap-6">
          {step < pages.length && (
            <>
              <button
                onClick={handleNext} 
                className="flex-1 bg-secondary text-white px-6 py-2 rounded-lg font-bold text-base hover:bg-[#334889] transition"
                aria-label="Bouton suivant"
              >
                Suivant
              </button>

              <button
                onClick={navigateToHome} 
                className="flex-1 border-2 border-secondary text-secondary px-6 py-2 rounded-lg font-bold text-base hover:bg-secondary hover:text-white transition"
                aria-label="Bouton passer l'onboarding"
              >
                Passer
              </button>
            </>
          )}

          {step === pages.length && (
            <button
              onClick={handleNext} 
              className="w-full bg-secondary text-white px-6 py-2 rounded-lg font-bold text-base hover:bg-[#334889] transition"
              aria-label="Commencer l'application"
            >
              Commencer
            </button>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-6 mb-4">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index + 1)} 
              className={`w-3 h-3 rounded-full transition ${
                step === index + 1 ? "bg-secondary scale-110" : "bg-gray-300"
              }`}
              aria-label={`Étape ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 
