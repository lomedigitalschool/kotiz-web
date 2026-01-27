import React, { useEffect, useState } from "react";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import { FaHome, FaUser, FaTachometerAlt, FaSignOutAlt, FaCog, FaLock, FaGlobe } from "react-icons/fa";
import logoHorizontale from "../assets/logos/logo_horizontale.png";
import SkeletonLoader from "../components/SkeletonLoader";


export default function ExplorerPage() {
  const { cagnottes, fetchAllCagnottes } = useCagnotteStore();
  const { user: currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOption, setSortOption] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  

  // On récupère toutes les cagnottes au chargement de la page
  useEffect(() => {
    const loadCagnottes = async () => {
      try {
        await fetchAllCagnottes();
      } catch (error) {
        console.error('Erreur lors du chargement des cagnottes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCagnottes();
  }, []);

  // Mise à jour automatique après les contributions
  useEffect(() => {
    // Écouter les changements dans le store pour rafraîchir automatiquement
    const unsubscribe = useCagnotteStore.subscribe((state) => {
      // Rafraîchir les données si nécessaire
      if (state.cagnottes.length > 0) {
        setRefreshKey(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  // Fonction pour filtrer et trier les cagnottes
  const getFilteredCagnottes = () => {
    if (!Array.isArray(cagnottes)) return [];
    
    return cagnottes
      .filter((c) => {
        if (!c || !c.title) return false;
        const title = c.title?.toLowerCase() || '';
        const search = searchTerm?.toLowerCase() || '';
        return title.includes(search);
      })
      .filter((c) => (filterType ? c.type === filterType : true))
      .sort((a, b) => {
        if (sortOption === "popular") {
          const aRatio = (a.currentAmount || 0) / (a.goalAmount || 1);
          const bRatio = (b.currentAmount || 0) / (b.goalAmount || 1);
          return bRatio - aRatio;
        }
        if (sortOption === "amount") return (b.currentAmount || 0) - (a.currentAmount || 0);
        if (sortOption === "date") {
          const aDate = new Date(a.createdAt || 0);
          const bDate = new Date(b.createdAt || 0);
          return bDate - aDate;
        }
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
            src={logoHorizontale}
            alt="Logo horizontal"
            className="w-40"
          />
        </div>

        {/* Navigation principale avec icônes */}
        <nav className="hidden md:flex flex-1 mx-20">
          <ul className="flex justify-between w-full font-medium">
            <li>
              <button
                onClick={() => navigate("/landing")}
                className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold"
              >
                <FaHome className="text-green-200 opacity-60" /> Accueil
              </button>
            </li>
            <li className="relative group">
              <button
                className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold"
              >
                <FaUser className="text-green-200 opacity-60" /> Profil
              </button>

              {/* Menu déroulant amelioré */}
              <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-10">
                <li>
                  <button
                    onClick={() => navigate("/profil")}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-t-lg"
                    style={{ color: '#3B5BAB' }}
                  >
                    <FaCog style={{ color: '#3B5BAB' }} /> Accéder à mon compte
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-b-lg"
                    style={{ color: '#dc2626' }}
                  >
                    <FaSignOutAlt style={{ color: '#dc2626' }} /> Déconnexion
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
                      onClick={async () => {
                        try {
                          // Utiliser la même méthode que les autres pages
                          const { logout: firebaseLogout } = await import('../services/auth');
                          await firebaseLogout(); // Déconnexion Firebase complète
                          logout(); // Nettoyage AuthContext
                          setShowLogoutConfirm(false);
                          navigate("/login");
                        } catch (error) {
                          console.error('Erreur lors de la déconnexion:', error);
                          // Forcer le nettoyage même en cas d'erreur
                          logout();
                          setShowLogoutConfirm(false);
                          navigate("/login");
                        }
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
                <FaTachometerAlt className="text-green-200 opacity-60" /> Dashboard
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

      {/* Informations utilisateur et filtres */}
      <div className="bg-white p-4 rounded shadow mb-4 sticky top-[4rem] z-10">
        {/* Info utilisateur */}
        {currentUser && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded">
            <span className="text-sm text-blue-700">
              👋 Connecté en tant que <strong>{currentUser.name || 'Utilisateur'}</strong>
            </span>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="flex flex-wrap gap-2 items-center">
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
      </div>

      {/*loader */}
      {loading && <SkeletonLoader type="default" />}

      {/* aucun resultat*/}
      {!loading && filteredCagnottes.length === 0 && (
        <p className="text-center mt-4 text-gray-500">
          Aucune cagnotte ne correspond à votre recherche.
        </p>
      )}

      {/* listes des cagnottes*/}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCagnottes.map((cagnotte) => {
          // Calcul du pourcentage de progression
          const currentAmount = cagnotte.currentAmount || 0;
          const goalAmount = cagnotte.goalAmount || 1; // Éviter division par zéro
          const percent = Math.min((currentAmount / goalAmount) * 100, 100);

          const isPopular = sortOption === "popular" && percent >= 50;
          const isPrivate = cagnotte.type === 'private';

          // Déterminer si l'utilisateur est propriétaire
          const isOwner = currentUser && (
            cagnotte.isOwner ||
            cagnotte.userId === currentUser.id ||
            cagnotte.owner?.id === currentUser.id
          );

          const hasMaskedDetails = isPrivate && !isOwner;

          // Couleur de la barre de progression
          const progressColor = percent >= 100 ? '#10B981' : '#3B82F6'; // Vert si complété, bleu sinon

          return (
            <li
              key={cagnotte.id}
              className={`border rounded p-3 shadow hover:shadow-md transition cursor-pointer ${isPopular ? "border-yellow-400" : ""} ${isPrivate ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
              onClick={() => navigate(`/cagnottes/${cagnotte.id}`)}
            >
              {/* Image de la cagnotte */}
              {cagnotte.imageUrl && cagnotte.imageUrl !== 'null' && cagnotte.imageUrl !== 'undefined' ? (
                <img
                  src={cagnotte.imageUrl.startsWith('http') ? cagnotte.imageUrl : `http://localhost:5000${cagnotte.imageUrl}`}
                  alt={cagnotte.title}
                  className="w-full h-40 object-cover rounded mb-2"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-gray-500">Aucune image</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{cagnotte.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isPrivate ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                  title={isPrivate ? 'Cagnotte privée - Détails réservés au propriétaire' : 'Cagnotte publique - Visible par tous'}
                >
                  {isPrivate ? <FaLock className="text-xs" /> : <FaGlobe className="text-xs" />}
                  {isPrivate ? 'Privé' : 'Public'}
                </span>
              </div>

              {/* Description */}
              {cagnotte.description && (
                <p className="text-sm text-gray-700 mt-1 mb-2">
                  {hasMaskedDetails ? "Description disponible pour les propriétaires uniquement" : cagnotte.description}
                </p>
              )}

              {/* Barre de progression avec accessibilité */}
              <div
                className="w-full bg-gray-200 h-4 rounded mt-2 relative"
                role="progressbar"
                aria-valuenow={hasMaskedDetails ? 30 : percent}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={hasMaskedDetails ? "Détails financiers masqués" : `Progression: ${percent.toFixed(1)}% atteint`}
                title={hasMaskedDetails ? "Détails réservés au propriétaire" : `Objectif: ${goalAmount.toLocaleString()} ${cagnotte.currency || 'XOF'}`}
              >
                <div
                  className={`h-4 rounded transition-all duration-500 ${hasMaskedDetails ? 'bg-gray-400 opacity-50' : ''}`}
                  style={{
                    width: hasMaskedDetails ? '30%' : `${percent}%`,
                    backgroundColor: hasMaskedDetails ? undefined : progressColor
                  }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {hasMaskedDetails ? (
                  <span title="Connectez-vous en tant que propriétaire pour voir les détails">
                    🔒 Détails financiers masqués
                  </span>
                ) : (
                  `${percent.toFixed(1)}% atteint • ${currentAmount.toLocaleString()} / ${goalAmount.toLocaleString()} ${cagnotte.currency || 'XOF'}`
                )}
              </p>

              {/* Indicateurs et actions supplémentaires */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {isPopular && (
                    <span className="text-yellow-600 font-bold text-sm">🔥 Populaire</span>
                  )}
                  {isPrivate && isOwner && (
                    <span className="text-blue-600 font-medium text-sm">👑 Propriétaire</span>
                  )}
                </div>

                {isPrivate && isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-cagnotte/${cagnotte.id}`);
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    title="Modifier cette cagnotte"
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>
            </li>

          );
        })}
      </ul>

    </div>
  );
}