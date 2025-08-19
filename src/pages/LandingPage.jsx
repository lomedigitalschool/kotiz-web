import React from "react"; 
import { FaLock, FaUsers, FaShareAlt, FaBell, FaTools } from "react-icons/fa";
import img1 from "../assets/img1.png"; 

const LandingPage = () => {
  return (
    <div className="w-full h-auto flex flex-col bg-white font-sans">
      {/* Navbar fixe en haut de la page */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-white shadow z-50">
        {/* Logo / nom de l'application */}
        <h1
          className="text-4xl font-bold"
          style={{
            color: "#4ca260",
            animation: "slowPulse 6s ease-in-out infinite", // Animation pulsante
          }}
        >
          KOTIZ
        </h1>

        {/* Boutons de connexion et inscription */}
        <div className="flex gap-4">
          <button className="text-[#3B5BAB] font-semibold hover:underline">
            Se connecter
          </button>
          <button className="bg-[#3B5BAB] text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Créer un compte
          </button>
        </div>
      </header>

      {/* Section Hero principale */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white px-6 pt-28 pb-16">
        {/* Texte principal et bouton d'action */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: "#3B5BAB" }}
          >
            Créez et gérez vos cagnottes en ligne facilement
          </h2>
          <p className="text-lg md:text-xl mb-6" style={{ color: "#4ca260" }}>
            Une solution simple et adaptée à l’Afrique pour collecter de l’argent
            en toute sécurité.
          </p>
          <button className="bg-[#3B5BAB] text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition shadow-lg">
            Commencer gratuitement
          </button>
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

      {/* Section fonctionnalités principales */}
      <section className="py-8 bg-gray-50">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: "#3B5BAB" }}
        >
          Nos fonctionnalités principales
        </h2>

        {/* Grille des fonctionnalités */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Fonctionnalité 1 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaUsers className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-2xl mb-2" style={{ color: "#3B5BAB" }}>
              Création rapide
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Créez votre cagnotte en quelques clics. Les utilisateurs veulent lancer
              une collecte sans complications.
            </p>
          </div>

          {/* Fonctionnalité 2 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaLock className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: "#3B5BAB" }}>
              Paiement sécurisé
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Les contributions sont protégées grâce à notre système fiable. La
              sécurité financière est cruciale.
            </p>
          </div>

          {/* Fonctionnalité 3 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaShareAlt className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: "#3B5BAB" }}>
              Partage facile
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Partagez le lien via WhatsApp, e-mail ou réseaux sociaux. La collecte
              gagne en visibilité rapidement.
            </p>
          </div>

          {/* Fonctionnalité 4 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaBell className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: "#3B5BAB" }}>
              Notifications et rappels
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Recevez des alertes quand quelqu’un contribue ou quand la cagnotte
              approche de son objectif.
            </p>
          </div>

          {/* Fonctionnalité 5 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaTools className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: "#3B5BAB" }}>
              Gestion flexible
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Modifiez la cagnotte, ajoutez des objectifs ou retirez des fonds
              facilement.
            </p>
          </div>

          {/* Fonctionnalité 6 */}
          <div className="p-6 border rounded-xl shadow-md text-center bg-white hover:shadow-lg transition">
            <FaLock className="text-5xl mb-3 mx-auto" style={{ color: "#3B5BAB" }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: "#3B5BAB" }}>
              Confidentialité
            </h3>
            <p style={{ color: "#4ca260" }} className="text-base">
              Vos informations et celles de vos participants restent privées et
              sécurisées.
            </p>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-6" style={{ backgroundColor: "#3B5BAB" }}>
        <h2 className="text-3xl font-bold mb-4 text-center text-white">
          Comment ça marche ?
        </h2>

        {/* Étapes */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 max-w-6xl mx-auto text-center">
          <div className="flex-1 md:flex-[1.3] px-6 py-3 rounded-xl shadow bg-white min-h-[100px]">
            <p className="font-bold text-3xl mb-1" style={{ color: "#3B5BAB" }}>1</p>
            <p style={{ color: "#4ca260" }} className="text-base">
              Créez votre cagnotte en quelques clics
            </p>
          </div>
          <div className="flex-1 md:flex-[1.2] px-6 py-3 rounded-xl shadow bg-white min-h-[100px]">
            <p className="font-bold text-3xl mb-1" style={{ color: "#3B5BAB" }}>2</p>
            <p style={{ color: "#4ca260" }} className="text-base">
              Partagez le lien avec vos proches
            </p>
          </div>
          <div className="flex-1 md:flex-[1.3] px-6 py-3 rounded-xl shadow bg-white min-h-[100px]">
            <p className="font-bold text-3xl mb-1" style={{ color: "#3B5BAB" }}>3</p>
            <p style={{ color: "#4ca260" }} className="text-base">
              Recevez les contributions en toute sécurité
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-600 border-t">
        © {new Date().getFullYear()}{" "}
        <span style={{ color: "#4ca260", fontWeight: "bold" }}>KOTIZ</span>. Tous
        droits réservés.
      </footer>
    </div>
  );
};

export default LandingPage;




