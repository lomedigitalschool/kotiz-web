import React, { useEffect, useState } from "react";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { FaHome, FaUser, FaTachometerAlt } from "react-icons/fa";


export default function ExplorerPage() {
  const { cagnottes, fetchAllCagnottes } = useCagnotteStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOption, setSortOption] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // On récupère toutes les cagnottes au chargement de la page
  useEffect(() => {
    fetchAllCagnottes().finally(() => setLoading(false));
  }, []);

  // Fonction pour filtrer et trier les cagnottes
  const getFilteredCagnottes = () => {
    return cagnottes
      .filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((c) => (filterType ? c.type === filterType : true))
      .sort((a, b) => {
        if (sortOption === "popular") {
          return b.currentAmount / b.goalAmount - a.currentAmount / a.goalAmount;
        }
        if (sortOption === "amount") return b.currentAmount - a.currentAmount;
        if (sortOption === "date") return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  };

  const filteredCagnottes = getFilteredCagnottes();

  return (
    <div className="explorer-page pt-[calc(4rem+1rem)] p-4">

      {/* header*/}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow-md z-50">

        {/* Logo + flèche retour vers la page d'accueil */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/landing")}>
          <img
            src="/src/assets/logos/logo_horizontale.png"
            alt="Logo horizontal"
            className="w-40"
          />
        </div>

        {/* Navigation principale avec icônes */}
        <nav className="hidden md:flex mx-4">
          <ul className="flex gap-6 font-medium">
            <li>
              <button
                onClick={() => navigate("/landing")}
                className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold"
              >
                <FaHome /> Accueil
              </button>
            </li>
            <li className="relative group">
              <button
                className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold"
              >
                <FaUser /> Profil
              </button>

              {/* Menu déroulant */}
              <ul className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity">
                <li>
                  <button
                    onClick={() => navigate("/profil")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Accéder à mon compte
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </li>
              </ul>
            </li>
            {/* Pop-up de confirmation */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-80">
                  <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
                  <p className="mb-6">Voulez-vous vraiment vous déconnecter ?</p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Non
                    </button>
                    <button
                      onClick={() => {
                        // la  Logique de déconnexion
                        localStorage.removeItem("token");
                        setShowLogoutConfirm(false);
                        navigate("/login");
                      }}
                      className="px-4 py-2 text-white rounded"
                      style={{ backgroundColor: "#4CA260" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                      onMouseLeave={e => e.currentTarget.style.opacity = 1}
                    >
                      Oui
                    </button>
                  </div>
                </div>
              </div>
            )}

            <li>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold"
              >
                <FaTachometerAlt /> Dashboard
              </button>
            </li>
          </ul>
        </nav>

        {/* Actions en haut à droite */}
        <div className="flex gap-3 md:gap-4 items-center">
          <Button
            onClick={() => navigate("/login")}
            variant="tertiary"
            className="text-sm md:text-base py-3 px-6"
          >
            Se connecter
          </Button>
          <Button
            onClick={() => navigate("/create-cagnotte")}
            variant="primary"
            className="text-sm md:text-base py-3 px-6"
          >
            Créer une cagnotte
          </Button>
        </div>
      </header>

      {/* Barre de rechercge et  filtre */}
      <div className="flex flex-wrap gap-2 mb-4 mt-4 items-center bg-white p-3 rounded shadow sticky top-[4rem] z-10">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous les types</option>
          <option value="public">Public</option>
          <option value="private">Privé</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="popular">Populaires</option>
          <option value="amount">Montant décroissant</option>
          <option value="date">Plus récents</option>
        </select>
      </div>

      {/*loader */}
      {loading && <p className="text-center mt-4">Chargement des cagnottes...</p>}

      {/* aucun resultat*/}
      {!loading && filteredCagnottes.length === 0 && (
        <p className="text-center mt-4 text-gray-500">
          Aucune cagnotte ne correspond à votre recherche.
        </p>
      )}

      {/* listes des cagnottes*/}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCagnottes.map((cagnotte) => {
          const percent = Math.round((cagnotte.currentAmount / cagnotte.goalAmount) * 100);
          const isPopular = sortOption === "popular" && percent >= 50;

          return (
            <li
              key={cagnotte.id}
              className={`border rounded p-3 shadow hover:shadow-md transition cursor-pointer ${isPopular ? "border-yellow-400" : ""}`}
              onClick={() => navigate(`/cagnotte/${cagnotte.id}`)}
            >
              {/* Image de la cagnotte */}
              {cagnotte.image && (
                <img
                  src={cagnotte.image}
                  alt={cagnotte.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}

              <h3 className="font-semibold">{cagnotte.title}</h3>

              {/* Description */}
              {cagnotte.description && (
                <p className="text-sm text-gray-700 mt-1 mb-2">{cagnotte.description}</p>
              )}

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 h-3 rounded mt-2">
                <div
                  className="h-3 rounded bg-green-600"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 mt-1">{percent}% atteint</p>

              {isPopular && (
                <span className="text-yellow-600 font-bold text-sm">🔥 Populaire</span>
              )}
            </li>

          );
        })}
      </ul>
    </div>
  );
}