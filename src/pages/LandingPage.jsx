import React, { useRef, useState } from "react";
import {
  FaLock, FaUsers, FaShareAlt, FaBell, FaTools, FaShieldAlt, FaRocket,
  FaChevronLeft, FaChevronRight, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp
} from "react-icons/fa";
import img1 from "../assets/img1.png";
import cagnotteIllustration from "../assets/illustrations/Cagnotte Digitale Amicale_simple_compose.png";
import paiementIllustration from "../assets/illustrations/Paiement Instantané Smartphone.png";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Button from "../components/Button";
import { colors } from '../theme/colors';
import logo from '../assets/logos/logo_horizontale.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  const scrollToSection = (ref) => {
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: FaRocket, title: "Création rapide", text: "Créez votre cagnotte en quelques clics.", bgColor: "bg-green-50", iconColor: colors.primary },
    { icon: FaShieldAlt, title: "Paiement sécurisé", text: "Les contributions sont protégées avec des partenaires fiables.", bgColor: "bg-green-50", iconColor: colors.primary, featured: true },
    { icon: FaShareAlt, title: "Partage facile", text: "Partagez votre lien sur WhatsApp, réseaux sociaux et e-mail.", bgColor: "bg-green-50", iconColor: colors.primary },
    { icon: FaBell, title: "Notifications", text: "Recevez des alertes lors des contributions.", bgColor: "bg-green-50", iconColor: colors.primary },
    { icon: FaTools, title: "Gestion flexible", text: "Modifiez vos cagnottes facilement.", bgColor: "bg-green-50", iconColor: colors.primary },
    { icon: FaLock, title: "Confidentialité", text: "Vos informations restent privées et sécurisées.", bgColor: "bg-green-50", iconColor: colors.primary }
  ];

  const nextFeature = () => setCurrentFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  const prevFeature = () => setCurrentFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1));

  return (
    <div className="w-full h-auto flex flex-col bg-white font-sans">
      <Header scrollToFeatures={() => scrollToSection(featuresRef)} scrollToHowItWorks={() => scrollToSection(howItWorksRef)} showAuthButtons={true} />

      {/* HERO */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 bg-gradient-to-b from-green-50 to-white px-6 pt-28 pb-16">
        <div className="md:w-1/2 text-center md:text-left">
          <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm mb-4 inline-block">
            N°1 des cagnottes en Afrique
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900">
            Créez et gérez vos <span className="text-green-600">cagnottes en ligne</span> simplement
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-700">
            Collectez de l’argent pour vos projets, événements et causes avec une solution pensée pour l’Afrique.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Button onClick={() => navigate("/register")} variant="primary">Créer une cagnotte</Button>
            <Button onClick={() => navigate("/explorePage")} variant="tertiary">Explorer</Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img src={img1} alt="Créer une cagnotte" className="w-[100%] max-w-xl rounded-2xl shadow-xl animate-slowPulse -ml-8" />
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 text-center gap-8">
          {[
            { number: "10K+", label: "cagnottes créées" },
            { number: "5M€", label: "collectés en Afrique" },
            { number: "50K+", label: "utilisateurs actifs" }
          ].map((stat, i) => (
            <div key={i} className="p-6">
              <h3 className="text-4xl font-bold text-green-600">{stat.number}</h3>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section ref={featuresRef} className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6 text-center text-gray-900">Nos fonctionnalités</h2>
          <div className="relative">
            {/* Flèches */}
            <button onClick={prevFeature} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-green-600 text-white shadow hover:scale-110 transition" aria-label="Précédent">
              <FaChevronLeft />
            </button>
            <button onClick={nextFeature} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-green-600 text-white shadow hover:scale-110 transition" aria-label="Suivant">
              <FaChevronRight />
            </button>

            {/* Carousel */}
            <div className="overflow-hidden px-12">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentFeature * 100}%)` }}>
                {features.map((feature, index) => (
                  <div key={index} className="flex-shrink-0 w-full px-4 flex justify-center">
                    <div className="p-8 h-96 w-full max-w-md rounded-3xl flex flex-col bg-white shadow hover:shadow-lg">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-100">
                          <feature.icon className="text-3xl text-green-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-2xl text-center mb-4 text-gray-800">{feature.title}</h3>
                      <p className="text-base text-center text-gray-600">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateurs */}
            <div className="flex justify-center mt-8 space-x-3">
              {features.map((_, index) => (
                <button key={index} onClick={() => setCurrentFeature(index)} className={`w-4 h-4 rounded-full ${index === currentFeature ? 'bg-green-600 scale-125' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Ils nous font confiance</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          {[
            { name: "Awa", text: "Grâce à Kotiz, j’ai pu financer mon mariage facilement !" },
            { name: "David", text: "Une solution simple et rapide pour mes projets associatifs." },
            { name: "Fatou", text: "Mes amis ont contribué depuis plusieurs pays sans souci." }
          ].map((t, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
              <p className="italic text-gray-700">“{t.text}”</p>
              <p className="mt-4 font-semibold text-green-700">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="how" ref={howItWorksRef} className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.primary }}>Comment ça marche ?</h2>

        {/* Étapes */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-6xl mx-auto px-4 mb-12">
          {[
            "Créez votre cagnotte en quelques clics",
            "Partagez le lien avec vos proches",
            "Recevez les contributions en toute sécurité"
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1 px-6 py-8 rounded-xl shadow bg-white min-h-[180px] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: colors.secondary }}>
                <p className="font-bold text-xl text-white">{index + 1}</p>
              </div>
              <p className="text-base font-medium text-center" style={{ color: colors.primary }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Illustrations */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <img
                src={cagnotteIllustration}
                alt="Cagnotte Digitale Amicale"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="text-center md:text-right">
              <img
                src={paiementIllustration}
                alt="Paiement Instantané Smartphone"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Questions fréquentes</h2>
        <div className="max-w-4xl mx-auto space-y-6 px-6">
          {[
            { q: "Comment créer une cagnotte ?", a: "Inscrivez-vous gratuitement et suivez 3 étapes simples." },
            { q: "Quels moyens de paiement sont disponibles ?", a: "Mobile money, et bientôt carte bancaire-PayPal." },
            { q: "Puis-je retirer l'argent facilement ?", a: "Oui, vos fonds sont transférables en toute sécurité." }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section finale */}
      <section className="bg-[#f7f9fc] flex flex-col justify-center items-center text-center py-20 px-4">
        <h2 className="text-3xl font-bold mb-8" style={{ color: colors.primary }}>Créez vos cagnottes en ligne facilement</h2>
        <p className="text-lg font-medium text-gray-600 max-w-xl mb-6" style={{ color: colors.black }}>Kotiz vous permet de collecter de l'argent en toute sécurité pour vos projets, événements et causes qui vous tiennent à cœur.</p>
        <Button onClick={() => navigate("/create-cagnotte")} variant="primary">Créer une cagnotte</Button>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="Kotiz Logo" className="w-36 mb-4" />
            <p className="text-sm">© 2025 Kotiz. Tous droits réservés.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
              <li><a href="#how" className="hover:text-white">Comment ça marche</a></li>
              <li><a onClick={() => navigate("/explorePage")} className="hover:text-white cursor-pointer">Explorer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Parlez de nous autour de vous</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/sharer/sharer.php?u=https://kotiz.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="w-5 h-5 cursor-pointer hover:text-white" />
              </a>
              <a href="https://twitter.com/intent/tweet?text=Découvrez Kotiz, la solution de cagnottes en ligne !&url=https://kotiz.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="w-5 h-5 cursor-pointer hover:text-white" />
              </a>
              <a href="https://www.instagram.com/kotizapp" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="w-5 h-5 cursor-pointer hover:text-white" />
              </a>
              <a href="https://wa.me/?text=Découvrez Kotiz, la solution de cagnottes en ligne ! Visitez https://kotiz.com" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="w-5 h-5 cursor-pointer hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
