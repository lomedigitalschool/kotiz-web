import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { FaUser, FaCog, FaSearch, FaIdCard, FaBell, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { FiShield } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import api from "../services/api";
import logoHorizontale from "../assets/logos/logo_horizontale.png";
import { useSilentRefresh } from "../hooks/useSilentRefresh";
import { useNotification } from "../contexts/NotificationContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotification();
  const { cagnottes, fetchUserCagnottes, contributions, fetchUserContributions, loading, error, deleteCagnotte, fetchCagnotteContributions } = useCagnotteStore();
  const [userStats, setUserStats] = useState({ totalCollected: 0, activeCount: 0, totalContributors: 0 });
  const [kycStatus, setKycStatus] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cagnotteContributions, setCagnotteContributions] = useState({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Nouveau flag pour s'assurer que les vraies données sont chargées

  // Mesure de performance
  useEffect(() => {
    console.time('Dashboard-Loading-Time');
    console.log('🚀 Dashboard: Début du chargement');

    return () => {
      console.timeEnd('Dashboard-Loading-Time');
      console.log('✅ Dashboard: Chargement terminé');
    };
  }, []);

  // Mesure du temps jusqu'aux vraies données
  useEffect(() => {
    if (dataLoaded) {
      console.timeEnd('Dashboard-Data-Load-Time');
      console.log('📊 Dashboard: Données utilisateur chargées');
    }
  }, [dataLoaded]);

  // Utiliser le hook de rafraîchissement silencieux
  const { forceRefresh } = useSilentRefresh(true, 60000); // Rafraîchissement toutes les 60 secondes

  const loadCagnotteContributions = async (cagnottesList) => {
    if (!cagnottesList || cagnottesList.length === 0) return;

    // Éviter les appels multiples pour les mêmes données
    const currentKeys = Object.keys(cagnotteContributions);
    const neededIds = cagnottesList.map(c => c.id.toString());
    const alreadyLoaded = neededIds.filter(id => currentKeys.includes(id));

    if (alreadyLoaded.length === neededIds.length) {
      console.log('✅ Toutes les contributions de cagnottes déjà chargées');
      return;
    }

    console.log(`🔄 Chargement des contributions pour ${cagnottesList.length} cagnottes en parallèle`);

    try {
      // Charger en parallèle avec Promise.all pour de meilleures performances
      const promises = cagnottesList.map(async (c) => {
        try {
          const data = await fetchCagnotteContributions(c.id);
          return { id: c.id, data };
        } catch (error) {
          console.error('Erreur chargement contributions cagnotte', c.id, error);
          return { id: c.id, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const contribs = { ...cagnotteContributions };

      results.forEach(({ id, data }) => {
        contribs[id] = data;
      });

      setCagnotteContributions(contribs);
      console.log('✅ Contributions de cagnottes chargées en parallèle');
    } catch (error) {
      console.error('❌ Erreur lors du chargement parallèle des contributions:', error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      console.time('Dashboard-Data-Load-Time');
      console.log('🔄 Dashboard: Chargement des données utilisateur');

      try {
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
        // Fetch contributions d'abord, puis cagnottes (pour calculer correctement)
        await fetchUserContributions();
        await fetchUserCagnottes();

        // Récupérer le statut KYC
        try {
          const kycResponse = await api.get('/kyc/status');
          setKycStatus(kycResponse.data.data);
        } catch (kycError) {
          console.error('Erreur lors de la récupération du statut KYC:', kycError);
          // Ne pas afficher d'erreur pour le KYC, juste laisser null
        }

        console.log('✅ Dashboard: Données principales chargées');

        // Marquer que les vraies données sont chargées
        setDataLoaded(true);

        // Charger les contributions pour chaque cagnotte de manière asynchrone (non-bloquante)
        const currentCagnottes = useCagnotteStore.getState().cagnottes;
        // Délai léger pour permettre au dashboard de s'afficher d'abord
        setTimeout(() => {
          loadCagnotteContributions(currentCagnottes);
        }, 100);

      } catch (error) {
        console.error('❌ Dashboard: Erreur lors du chargement:', error);
        setDataLoaded(true); // Même en cas d'erreur, permettre l'affichage
      } finally {
        setDashboardLoading(false);
      }
    };

    loadUserData();
  }, []); // une seule fois

  useEffect(() => {
    const handleFocus = async () => {
      console.log('🔄 Dashboard: Rafraîchissement au focus');
      await fetchUserContributions();
      await fetchUserCagnottes();
      const currentCagnottes = useCagnotteStore.getState().cagnottes;
      await loadCagnotteContributions(currentCagnottes);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserCagnottes, fetchUserContributions]);


  // --- Préparer les jeux de données pour les graphiques (useMemo pour stabilité) ---
  const cagnottesById = useMemo(() => {
    const map = new Map();
    (cagnottes || []).forEach(c => {
      map.set(c.id, { ...c });
    });
    return map;
  }, [cagnottes]);

  // Memoize les statistiques pour éviter les recalculs inutiles
  const memoizedUserStats = useMemo(() => userStats, [userStats.totalCollected, userStats.activeCount, userStats.totalContributors]);

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

  // --- Calcul des statistiques ---
  useEffect(() => {
    // totalCollected = somme des montants actuels des cagnottes
    let totalCollected = 0;
    cagnottes.forEach(c => {
      totalCollected += parseFloat(c.currentAmount) || 0;
    });

    // activeCount à partir des cagnottes
    const activeCount = (cagnottes || []).filter(c =>
      c.status === 'active' || c.status === 'pending' || !c.status
    ).length;

    // totalContributors : somme des contributorsCount des cagnottes
    let totalContributors = 0;
    cagnottes.forEach(c => {
      totalContributors += c.contributorsCount || 0;
    });

    const stats = {
      totalCollected,
      activeCount,
      totalContributors
    };
    console.log('📊 Dashboard calculated stats:', stats);
    setUserStats(stats);
  }, [cagnottes]);

  // Attendre que les vraies données soient chargées avant d'afficher quoi que ce soit
  if (dashboardLoading || loading || !dataLoaded) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Chargement de vos données...</p>
      </div>
    );
  }
  if (error) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#dc2626" }}>{error}</p>;

  const COLORS = ["#3B5BAB", "#4CA260", "#997A8D", "#806D5A", "#149414", "#4E3D28", "#BBD2E1", "#3A020D", "#C1BFB1", "#22780F", "#997A8D", "#40826D", "#BBACAC", "#5A5E6B", "#83A697"];

  try {
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

      {/* Statut KYC */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiShield className="text-gray-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Vérification d'identité</h3>
              {kycStatus?.hasActiveKyc ? (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    kycStatus.statutVerification === 'APPROUVE'
                      ? 'bg-green-100 text-green-800'
                      : kycStatus.statutVerification === 'REFUSE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FiShield className="mr-1" />
                    {kycStatus.statutVerification === 'APPROUVE'
                      ? 'Vérifié'
                      : kycStatus.statutVerification === 'REFUSE'
                      ? 'Refusé'
                      : 'En attente de vérification'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Soumis le {new Date(kycStatus.submissionDate).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <p className="text-gray-600 text-sm mt-1">Non vérifié</p>
              )}
            </div>
          </div>
          {!kycStatus?.hasActiveKyc && (
            <button
              onClick={() => navigate("/kyc")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Vérifier mon identité
            </button>
          )}
        </div>
        {kycStatus?.commentaireAdmin && (
          <p className="text-sm text-gray-600 mt-2">
            <strong>Commentaire admin:</strong> {kycStatus.commentaireAdmin}
          </p>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Montants collectés</p>
          <p className="text-2xl font-bold text-green-600">{(memoizedUserStats.totalCollected || 0).toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Cagnottes actives</p>
          <p className="text-2xl font-bold text-blue-600">{memoizedUserStats.activeCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Nombre de contributeurs</p>
          <p className="text-2xl font-bold text-purple-600">{memoizedUserStats.totalContributors || 0}</p>
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
            <div key={c.id} className={`bg-white rounded-2xl shadow p-6 cursor-pointer ${c.status === 'closed' ? 'border-2 border-red-200 bg-red-50' : ''}`} onClick={() => navigate(`/cagnottes/${c.id}`)}>
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
                <span className={`font-semibold px-2 py-1 rounded ${
                  c.status === 'closed'
                    ? 'text-red-600 bg-red-100'
                    : c.status === 'active'
                    ? 'text-blue-600 bg-blue-100'
                    : ''
                }`}>
                  Statut: {c.status === 'closed' ? 'Fermé' : c.status === 'active' ? 'Actif' : c.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div className="h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: c.status === 'closed' ? '#DC2626' : colors.primary }} />
              </div>
              <p className="text-right text-gray-700 font-semibold mb-2">
                {collectedAmount.toLocaleString()} / {goalAmount.toLocaleString()} {c.currency}
              </p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => navigate(`/cagnottes/${c.id}`)} className="px-4 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: colors.secondary }} >
                  Voir détails
                </button>
                {c.status !== 'closed' && (
                  <>
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
                        notify(`Cagnotte "${c.title}" supprimée avec succès`, 'success');
                        // Pas besoin de redirection car on est déjà sur le dashboard
                      } catch (error) {
                        console.error('Erreur lors de la suppression:', error);
                        notify('Erreur lors de la suppression. Vérifiez que vous êtes le propriétaire.', 'error');
                      }
                    }} className="px-4 py-2 rounded-md text-white hover:opacity-90 transition" style={{ backgroundColor: "#EF4444" }} >
                      Supprimer
                    </button>
                  </>
                )}
                {c.status === 'closed' && (
                  <span className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold">
                    Cagnotte fermée
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contributeurs par cagnotte */}
      <h2 className="text-2xl font-bold mb-4">Contributeurs par cagnotte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cagnottes.map(c => {
          const cContributors = cagnotteContributions[c.id] || [];
          if (cContributors.length === 0) return null;
          const previewContributors = cContributors.slice(0, 3);
          return (
            <div key={c.id} className="bg-white shadow rounded-xl p-4 flex flex-col">
              <h3 className="font-semibold mb-2">{c.title}</h3>
              {/* Aperçu contributeurs */}
              <div className="flex flex-col gap-1 mb-2">
                {previewContributors.map(contrib => {
                  const isAnonymous = !contrib.userId || !contrib.contributor;
                  return (
                    <div key={contrib.id} className="flex justify-between items-center px-2 py-1 rounded text-sm" style={{ backgroundColor: "#f3f4f6" }} title={isAnonymous ? "Anonyme" : contrib.contributor?.name || "Contributeur"} >
                      <span className="truncate">{isAnonymous ? "Anonyme" : contrib.contributor?.name || "Contributeur"}</span>
                      <span className="font-semibold">{(parseFloat(contrib.amount) || 0).toLocaleString()} {contrib.currency}</span>
                    </div>
                  );
                })}
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
  } catch (renderError) {
    console.error('Erreur de rendu Dashboard:', renderError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur d'affichage</h2>
          <p className="text-gray-600 mb-4">Le dashboard ne peut pas s'afficher correctement.</p>
          <p className="text-sm text-gray-500 mb-4">Erreur: {renderError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
