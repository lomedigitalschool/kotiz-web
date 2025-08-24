import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header1 from "../components/Header1.jsx";

// Composant principal pour explorer les campagnes
const ExplorePage = ({ campaigns = [] }) => {
  const navigate = useNavigate();

  // État pour gérer la recherche, la localisation et le tri
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("recent"); // Options : "recent", "popular", "amount-high", "amount-low"

  // Fonction pour faire défiler jusqu'à une section spécifique
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtrage et tri des campagnes en fonction des critères de recherche
  const filteredCampaigns = campaigns
    .filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter(c => (location ? c.location.toLowerCase().includes(location.toLowerCase()) : true))
    .sort((a, b) => {
      if (sort === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "popular") return b.backers - a.backers;
      if (sort === "amount-high") return b.goalAmount - a.goalAmount;
      if (sort === "amount-low") return a.goalAmount - b.goalAmount;
      return 0;
    });

  return (
    <>
      {/* En-tête avec navigation */}
      <div className=" ">
        <Header1 scrollToFeatures={() => scrollToSection(featuresRef)} scrollToHowItWorks={() => scrollToSection(howItWorksRef)} />
      </div>

      <div className="p-6">
        {/* Barre de recherche et filtres */}
        <div className="flex flex-wrap gap-2 mb-6 mt-20">
          <input
            type="text"
            placeholder="Rechercher des campagnes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-64"
          />

          <input
            type="text"
            placeholder="Localisation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded w-48"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="recent">Récent</option>
            <option value="popular">Populaire</option>
            <option value="amount-high">Montant élevé</option>
            <option value="amount-low">Montant faible</option>
          </select>
        </div>

        {/* Liste des campagnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.map(c => (
            <div key={c.id} className="border rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/cagnotte/${c.id}`)}>
              <img src={c.image} alt={c.title} className="w-full h-40 object-cover rounded" />
              <h3 className="text-lg font-semibold mt-2">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description}</p>
              <p className="text-sm mt-1">📍 {c.location}</p>
              <p className="text-sm mt-1">🎯 Objectif: {c.goalAmount} XOF</p>
              <button className="mt-3 bg-[#4ca260] text-white px-4 py-2 rounded">
                Voir plus
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExplorePage;
