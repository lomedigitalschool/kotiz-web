import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { FaUser, FaCog, FaSearch, FaIdCard, FaBell, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import api from "../services/api";
import logoHorizontale from "../assets/logos/logo_horizontale.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { cagnottes, fetchUserCagnottes, contributions, fetchUserContributions, loading, error, deleteCagnotte } = useCagnotteStore();
  const [userStats, setUserStats] = useState({ totalCollected: 0, activeCount: 0, totalContributors: 0 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🔄 Dashboard: Chargement des données utilisateur');
        const { auth } = await import('../config/firebase');
        if (auth.currentUser) {
          console.log('👤 Utilisateur Firebase connecté:', {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified
          });
        } else {
          console.warn('⚠️ Aucun utilisateur Firebase connecté');
        }

        useCagnotteStore.getState().cleanMockData();
        // Fetch cagnottes d'abord (pour initialiser map), puis contributions
        await fetchUserCagnottes();
        await fetchUserContributions();
        console.log('✅ Dashboard: Données utilisateur chargées');
      } catch (error) {
        console.error('❌ Dashboard: Erreur lors du chargement:', error);
      }
    };

    loadUserData();
  }, []); // une seule fois

  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Dashboard: Rafraîchissement au focus');
      fetchUserCagnottes();
      fetchUserContributions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserCagnottes, fetchUserContributions]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Dashboard: Rafraîchissement automatique');
      fetchUserCagnottes();
      fetchUserContributions();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUserCagnottes, fetchUserContributions]);

  // --- Préparer les jeux de données pour les graphiques (useMemo pour stabilité) ---
  const cagnottesById = useMemo(() => {
    const map = new Map();
    (cagnottes || []).forEach(c => {
      map.set(c.id, { ...c });
    });
    return map;
  }, [cagnottes]);

  // Agrégation des contributions par cagnotteId (à partir des contributions)
  const contributionsAggregated = useMemo(() => {
    const map = new Map(); // cagnotteId -> { total, contributors: Set }
    (contributions || []).forEach(contrib => {
      const cagId = contrib.cagnotteId || contrib.pullId; // sécurité
      const amount = parseFloat(contrib.amount) || 0;
      if (!map.has(cagId)) {
        map.set(cagId, { total: 0, contributors: new Set() });
      }
      const current = map.get(cagId);
      current.total += amount;
      // utiliser userId si dispo sinon nom/email pour unique
      const contributorKey = contrib.userId || contrib.user || contrib.contributorName || contrib.contributorEmail || `anon-${contrib.id || Math.random()}`;
      current.contributors.add(contributorKey);
    });
    return map;
  }, [contributions]);

  // Data pour BarChart (montants collectés par cagnotte) : on merge cagnottes et contributionsAggregated
  const barData = useMemo(() => {
    const data = [];
    (cagnottes || []).forEach(c => {
      const cagId = c.id;
      const agg = contributionsAggregated.get(cagId);
      const total = agg ? agg.total : (parseFloat(c.currentAmount) || 0);
      data.push({
        title: c.title || 'Sans titre',
        currentAmount: total,
        id: cagId
      });
    });
    return data;
  }, [cagnottes, contributionsAggregated]);

  // Data pour PieChart (utiliser seulement cagnottes avec montant > 0)
  const pieData = useMemo(() => {
    return barData.filter(d => (d.currentAmount || 0) > 0);
  }, [barData]);

  // --- Calcul des statistiques (totalCollected à partir des contributions agrégées) ---
  useEffect(() => {
    // totalCollected = somme des totaux par cagnotte de l'utilisateur
    let totalCollected = 0;
    for (const [, agg] of contributionsAggregated) {
      totalCollected += agg.total || 0;
    }

    // activeCount à partir des cagnottes
    const activeCount = (cagnottes || []).filter(c =>
      c.status === 'active' || c.status === 'pending' || !c.status
    ).length;

    // totalContributors : union de tous les contributeurs des cagnottes de l'utilisateur
    const allContributorIds = new Set();
    for (const [, agg] of contributionsAggregated) {
      agg.contributors.forEach(id => allContributorIds.add(id));
    }

    const stats = {
      totalCollected,
      activeCount,
      totalContributors: allContributorIds.size
    };
    console.log('📊 Dashboard calculated stats:', stats);
    setUserStats(stats);
  }, [contributionsAggregated, cagnottes]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}>Chargement...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#dc2626" }}>{error}</p>;

  const COLORS = ["#3B5BAB", "#4CA260", "#997A8D", "#806D5A", "#149414", "#4E3D28", "#BBD2E1", "#3A020D", "#C1BFB1", "#22780F", "#997A8D", "#40826D", "#BBACAC", "#5A5E6B", "#83A697"];

  return (
    <div className="pt-[calc(4rem+1rem)] p-6 mx-auto font-roboto" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow-md z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/landing")}>
          <img src={logoHorizontale} alt="Logo horizontal" className="w-40" />
        </div>
        {/* Navigation principale */}
        <nav className="hidden md:flex flex-1 mx-20">
          <ul className="flex justify-between w-full font-medium">
            <li>
              <button onClick={() => navigate("/explorePage")} className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold" >
                <FaSearch className="text-green-200 opacity-60" /> Explorer
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/kyc")} className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold" >
                <FaIdCard className="text-green-200 opacity-60" /> Vérifier mon identité
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/notifications")} className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold" >
                <FaBell className="text-green-200 opacity-60" /> Notifications
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/transactions")} className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold" >
                <FaWallet className="text-green-200 opacity-60" /> Transactions
              </button>
            </li>
            <li className="relative group">
              <button className="flex items-center gap-1 text-black hover:text-green-600 transition-colors font-semibold" >
                <FaUser className="text-green-200 opacity-60" /> Profil
              </button>
              {/* Menu déroulant */}
              <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-10">
                <li>
                  <button onClick={() => navigate("/profil")} className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-t-lg" style={{ color: '#3B5BAB' }} >
                    <FaCog style={{ color: '#3B5BAB' }} /> Accéder à mon compte
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-b-lg" style={{ color: '#dc2626' }} >
                    <FaSignOutAlt style={{ color: '#dc2626' }} /> Déconnexion
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        {/* Actions utilisateur */}
        <div className="flex gap-3 md:gap-4 items-center">
          <button onClick={() => navigate("/create-cagnotte")} className="px-6 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: colors.primary }} >
            Créer une cagnotte
          </button>
        </div>
      </header>

      {/* Pop-up de confirmation de déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
            <p className="mb-6">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" >
                Non
              </button>
              <button onClick={async () => {
                try {
                  // Utiliser la même méthode que la page de profil
                  const { logout: firebaseLogout } = await import('../services/auth');
                  await firebaseLogout();
                  // Déconnexion Firebase complète
                  logout();
                  // Nettoyage AuthContext
                  setShowLogoutConfirm(false);
                  navigate("/login");
                } catch (error) {
                  console.error('Erreur lors de la déconnexion:', error);
                  // Forcer le nettoyage même en cas d'erreur
                  logout();
                  setShowLogoutConfirm(false);
                  navigate("/login");
                }
              }} className="px-4 py-2 text-white rounded" style={{ backgroundColor: "#4CA260" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1} >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bannière de vérification email */}
      <EmailVerificationBanner />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Montants collectés</p>
          <p className="text-2xl font-bold text-green-600">{(userStats.totalCollected || 0).toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Cagnottes actives</p>
          <p className="text-2xl font-bold text-blue-600">{userStats.activeCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Nombre de contributeurs</p>
          <p className="text-2xl font-bold text-purple-600">{userStats.totalContributors || 0}</p>
        </div>
      </div>

      {/* Graphiques */}
      {Array.isArray(cagnottes) && cagnottes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold mb-2">Montants collectés par cagnotte</h2>

            {/* Fallback si barData vide */}
            {barData.length === 0 || barData.every(d => (d.currentAmount || 0) === 0) ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>Aucune donnée de collecte disponible pour l'instant.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Montant']} />
                  <Bar dataKey="currentAmount" fill={colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold mb-2">Répartition des contributions</h2>
            {pieData.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>Aucune répartition disponible pour l'instant.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="currentAmount"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.title}: ${entry.currentAmount.toLocaleString()}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${entry.id}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Montant']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: "#6b7280" }}>Vous n'avez pas encore de cagnottes.</p>
      )}

      {/* Mes cagnottes */}
      <h2 className="text-2xl font-bold mb-4">Mes Cagnottes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cagnottes.map(c => {
           const cagId = c.id;
           const agg = contributionsAggregated.get(cagId);
           const collectedAmount = agg ? agg.total : parseFloat(c.currentAmount || c.collectedAmount || 0);
           const goalAmount = c.goalAmount || 1; // Éviter division par zéro
           const progress = goalAmount > 0 ? Math.min((collectedAmount / goalAmount) * 100, 100) : 0;
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow p-6 cursor-pointer" onClick={() => navigate(`/cagnottes/${c.id}`)}>
              {c.imageUrl && c.imageUrl !== 'null' && c.imageUrl !== 'undefined' ? (
                <img src={c.imageUrl.startsWith('http') ? c.imageUrl : `https://kotiz-back.onrender.com${c.imageUrl}`} alt={c.title} className="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Aucune image</span>
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{c.title}</h3>
              <p className="text-gray-700 mb-2">{c.description}</p>
              {/* Type et statut */}
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Type: {c.type}</span>
                <span>Statut: {c.status}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div className="h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: colors.primary }} />
              </div>
              <p className="text-right text-gray-700 font-semibold mb-2">
                {collectedAmount.toLocaleString()} / {goalAmount.toLocaleString()} {c.currency}
              </p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => navigate(`/cagnottes/${c.id}`)} className="px-4 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: colors.secondary }} >
                  Voir détails
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-cagnotte/${c.id}`); }} className="px-4 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: colors.primary }} >
                  Modifier
                </button>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm(`Supprimer la cagnotte "${c.title}" ?`)) return;
                  try {
                    // Appel API pour supprimer la cagnotte
                    await api.delete(`/pulls/${c.id}`);
                    // Supprimer du store local
                    deleteCagnotte(c.id);
                    alert(`Cagnotte "${c.title}" supprimée avec succès`);
                    // Pas besoin de redirection car on est déjà sur le dashboard
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression. Vérifiez que vous êtes le propriétaire.');
                  }
                }} className="px-4 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: "#EF4444" }} >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contributeurs par cagnotte */}
      <h2 className="text-2xl font-bold mb-4">Contributeurs par cagnotte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cagnottes.map(c => {
          const cContributors = contributions.filter(contrib => contrib.cagnotteId === c.id);
          if (cContributors.length === 0) return null;
          const previewContributors = cContributors.slice(0, 3);
          return (
            <div key={c.id} className="bg-white shadow rounded-xl p-4 flex flex-col">
              <h3 className="font-semibold mb-2">{c.title}</h3>
              {/* Aperçu contributeurs */}
              <div className="flex flex-col gap-1 mb-2">
                {previewContributors.map(contrib => (
                  <div key={contrib.id} className="flex justify-between items-center px-2 py-1 rounded text-sm" style={{ backgroundColor: "#f3f4f6" }} title={contrib.anonymous ? "Anonyme" : contrib.contributor?.name || contrib.user} >
                    <span className="truncate">{contrib.anonymous ? "Anonyme" : contrib.contributor?.name || contrib.user}</span>
                    <span className="font-semibold">{(parseFloat(contrib.amount) || 0).toLocaleString()} {contrib.currency}</span>
                  </div>
                ))}
              </div>
              {cContributors.length > 3 && (
                <button onClick={() => navigate(`/contributors/${c.id}`)} className="mt-auto px-3 py-1 rounded text-white hover:opacity-90 transition text-sm" style={{ backgroundColor: colors.primary }} >
                  Voir tous les contributeurs
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Historique de mes contributions */}
      <h2 className="text-2xl font-bold mb-4">Historique de mes contributions</h2>
      {contributions.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Aucune contribution pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/3">Cagnotte</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-1/4">Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-28">Montant</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Anonymat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contributions.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-800 font-semibold truncate max-w-xs">{c.cagnotteTitle}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center text-gray-800 font-bold w-28">
                    {(parseFloat(c.amount) || 0).toLocaleString()} {c.currency}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full ${c.anonymous ? "bg-gray-500" : ""}`} style={{ backgroundColor: c.anonymous ? undefined : colors.primary }} >
                      {c.anonymous ? "Anonyme" : "Nom connu"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
