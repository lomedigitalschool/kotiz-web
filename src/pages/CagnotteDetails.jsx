import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import QRCode from "react-qr-code";
import { colors } from "../theme/colors";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { useAuth } from "../hooks/useAuth";
import { FaFacebook, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import SkeletonLoader from "../components/SkeletonLoader";

// Fonction utilitaire pour les appels API publics (sans authentification)
const fetchPublic = async (endpoint) => {
  const response = await fetch(`http://localhost:5000/api/v1${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};

const ITEMS_PER_PAGE = 3;

const CagnotteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cagnotte, setCagnotte] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
   const [userLoading, setUserLoading] = useState(true);
   const [kycStatus, setKycStatus] = useState(null);
   const [kycLoading, setKycLoading] = useState(true);
 
   // Calculer le montant total collecté à partir des contributions pour cohérence
   const calculatedCurrentAmount = useMemo(() =>
     contributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0),
     [contributions]
   );
 
   useEffect(() => {
    const fetchCagnotteDetails = async () => {
      try {
        setLoading(true);
        console.log('Chargement de la cagnotte:', id, 'Refresh key:', refreshKey);

        // Fonction helper pour essayer public puis authentifié
        const fetchWithFallback = async (endpoint) => {
          try {
            const publicData = await fetchPublic(endpoint);
            return { data: { data: publicData }, source: 'public' };
          } catch (publicError) {
            console.log(`❌ ${endpoint} public échoué, tentative avec auth:`, publicError.message);
            const authData = await api.get(endpoint);
            return { data: authData, source: 'auth' };
          }
        };

        // Charger la cagnotte et les contributions en parallèle
        const [cagnotteResult, contributionsResult] = await Promise.all([
          fetchWithFallback(`/pulls/${id}`),
          fetchWithFallback(`/pulls/${id}/contributions`).catch(() => ({ data: { data: [] }, source: 'none' })) // Fallback si contributions échoue
        ]).catch(error => {
          console.error('Erreur lors du chargement parallèle:', error);
          throw error;
        });

        console.log('✅ Cagnotte récupérée via', cagnotteResult.source);
        console.log('✅ Contributions récupérées via', contributionsResult.source);

        // Traiter les données de la cagnotte
        const cagnotteResponse = cagnotteResult.data.data || cagnotteResult.data;
        const cagnotteData = cagnotteResponse.data || cagnotteResponse;
        console.log('Données de la cagnotte:', cagnotteData);
        setCagnotte(cagnotteData);

        // Utiliser les contributions de la réponse de la cagnotte si disponibles, sinon celles de l'endpoint séparé
        let finalContributions = [];
        if (cagnotteData.contributions && Array.isArray(cagnotteData.contributions)) {
          finalContributions = cagnotteData.contributions;
          console.log('✅ Contributions trouvées dans les données de la cagnotte');
        } else if (cagnotteData.recentContributions && Array.isArray(cagnotteData.recentContributions)) {
          finalContributions = cagnotteData.recentContributions;
          console.log('✅ Contributions trouvées dans recentContributions');
        } else {
          // Utiliser les contributions de l'endpoint séparé
          const contribResponse = contributionsResult.data.data || contributionsResult.data;
          finalContributions = contribResponse.data || contribResponse || [];
          console.log('✅ Contributions chargées séparément');
        }

        setContributions(finalContributions);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);

        // Gestion spécifique des erreurs d'accès
        if (err.response?.status === 403) {
          setError("Accès refusé - Cette cagnotte est privée. Connectez-vous avec le compte propriétaire pour y accéder.");
        } else if (err.response?.status === 404) {
          // Message d'erreur plus informatif avec options de navigation
          setError(
            <div className="text-center">
              <p className="mb-4">Cette cagnotte n'existe pas ou n'est plus accessible.</p>
              <p className="mb-4 text-sm text-gray-600">Elle pourrait avoir été fermée, supprimée, ou vous n'avez pas les droits d'accès.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/explorePage')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Explorer les cagnottes
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Retour au dashboard
                </button>
              </div>
            </div>
          );
        } else {
          setError(err.response?.data?.message || "Erreur lors du chargement de la cagnotte");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCagnotteDetails();
  }, [id, refreshKey]);

  // Détecter si on vient d'une modification ou rafraîchir périodiquement
  useEffect(() => {
    const state = location.state;
    if (state && state.fromEdit) {
      console.log('Détection d\'une modification, forçage du rechargement');
      setRefreshKey(prev => prev + 1);
    }
  }, [location.state]);
  
  // Rafraîchir automatiquement toutes les 5 minutes (au lieu de 30 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Rafraîchissement automatique des détails de la cagnotte');
      setRefreshKey(prev => prev + 1);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
  
  // Rafraîchissement au focus supprimé pour une navigation plus fluide

  // Clôture automatique de la cagnotte
  useEffect(() => {
    const checkAndCloseCagnotte = async () => {
      if (!cagnotte || cagnotte.status !== 'active' || !contributions) return;

      const currentAmount = cagnotte.currentAmount || 0;
      const goalAmount = cagnotte.goalAmount;
      const deadline = cagnotte.deadline ? new Date(cagnotte.deadline) : null;
      const now = new Date();
      const participantLimit = cagnotte.participantLimit;
      const nbContribs = contributions.length;

      // Conditions de clôture automatique
      const isGoalReached = currentAmount >= goalAmount;
      const isDeadlinePassed = deadline && now > deadline;
      const isParticipantLimitReached = participantLimit && nbContribs >= participantLimit;

      const shouldClose = isGoalReached || isDeadlinePassed || isParticipantLimitReached;

      if (shouldClose) {
        console.log('🔒 Conditions de clôture remplies, fermeture automatique de la cagnotte:', cagnotte.id);
        console.log('📊 Détails:', {
          isGoalReached,
          currentAmount,
          goalAmount,
          isDeadlinePassed,
          deadline,
          isParticipantLimitReached,
          participantLimit,
          nbContribs
        });

        try {
          await api.put(`/pulls/${cagnotte.id}`, { status: 'closed' });
          console.log('✅ Cagnotte fermée automatiquement');
          setRefreshKey(prev => prev + 1); // Rafraîchir les données
        } catch (error) {
          console.error('❌ Erreur lors de la clôture automatique:', error);
        }
      }
    };

    // Vérifier immédiatement et toutes les 2 minutes
    checkAndCloseCagnotte();
    const interval = setInterval(checkAndCloseCagnotte, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [cagnotte, contributions, calculatedCurrentAmount]);


  // accès utilisateur - récupérer l'utilisateur depuis l'API
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          setCurrentUserData(response.data);
        }
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
      } finally {
        setUserLoading(false);
      }
    };

    if (cagnotte) {
      fetchCurrentUser();
    }
  }, [cagnotte]);

  // récupérer le statut KYC de l'utilisateur
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        setKycLoading(true);
        const response = await api.get('/kyc/status');
        setKycStatus(response.data.data);
      } catch (error) {
        console.error('Erreur récupération statut KYC:', error);
        setKycStatus({ hasActiveKyc: false, status: null });
      } finally {
        setKycLoading(false);
      }
    };

    if (currentUserData) {
      fetchKycStatus();
    }
  }, [currentUserData]);

  if (loading) return <SkeletonLoader type="default" />;
  if (error) return <div style={{ textAlign: "center", marginTop: 80, color: "#ef4444" }}>{error}</div>;
  if (!cagnotte) return <p className="text-center mt-20 text-gray-500">Cagnotte introuvable...</p>;

  if (userLoading) return <p className="text-center mt-[80px] text-gray-500">Vérification des accès...</p>;

  const userId = currentUserData?.id;
  // Le backend contrôle déjà l'accès, donc si on arrive ici c'est qu'on a accès
  // Mais on peut utiliser isOwner pour afficher des informations supplémentaires
  const isOwner = cagnotte.isOwner || (cagnotte.userId === userId) || (cagnotte.owner?.id === userId);

  const progress = Math.min((calculatedCurrentAmount / cagnotte.goalAmount) * 100, 100);

  // Vérifier les conditions pour le retrait
  const currentAmount = calculatedCurrentAmount;
  const goalAmount = cagnotte.goalAmount;
  const deadline = cagnotte.deadline ? new Date(cagnotte.deadline) : null;
  const now = new Date();

  const isGoalReached = currentAmount >= goalAmount;
  const isDeadlinePassed = deadline && now > deadline;
  const isClosed = cagnotte.status === 'closed';
  const hasApprovedKyc = kycStatus && kycStatus.statutVerification === 'APPROUVE';

  // Conditions de retrait : propriétaire + (objectif atteint OU deadline dépassée OU fermée) + KYC approuvé
  const canWithdraw = isOwner && (isGoalReached || isDeadlinePassed || isClosed) && hasApprovedKyc;
  const canWithdrawWithoutKyc = isOwner && (isGoalReached || isDeadlinePassed || isClosed);

  // stats
  console.log('Contributions:', contributions, 'Cagnotte ID:', cagnotte.id, typeof cagnotte.id);
  // Les contributions sont déjà filtrées par l'API, pas besoin de filtrer à nouveau
  const allContribs = contributions;
  console.log('allContribs:', allContribs);
  const totalPages = Math.ceil(allContribs.length / ITEMS_PER_PAGE);
  const currentList = allContribs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const nbContribs = allContribs.length;
  const avgDonation = nbContribs > 0 ? allContribs.reduce((acc, c) => acc + c.amount, 0) / nbContribs : 0;
  const remain = Math.max(cagnotte.goalAmount - calculatedCurrentAmount, 0);

  const creationDate = new Date(cagnotte.createdAt);
  const daysElapsed = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));

  const shareLink = `${window.location.origin}/cagnottes/${cagnotte.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Lien copié !");
  };



  return (
    <div className="p-5 font-roboto max-w-6xl mx-auto">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
      >
        ← Retour au Dashboard
      </button>
      <div className="bg-white rounded-[18px] shadow-lg overflow-hidden">
        <div>
          {cagnotte.imageUrl && cagnotte.imageUrl !== 'null' && cagnotte.imageUrl !== 'undefined' ? (
            <img
              src={cagnotte.imageUrl.startsWith('http') ? cagnotte.imageUrl : `http://localhost:5000${cagnotte.imageUrl}`}
              alt={cagnotte.title}
              className="w-full h-64 object-cover rounded-md mb-3"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
              <span className="text-gray-500">Aucune image</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: "#1f2937" }}>
            {cagnotte.title}
          </h1>

          {/* Notification pour le propriétaire quand les conditions de clôture sont remplies */}
          {isOwner && cagnotte.status === 'active' && (isGoalReached || isDeadlinePassed || (cagnotte.participantLimit && nbContribs >= cagnotte.participantLimit)) && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <strong>Conditions de clôture remplies :</strong> {isGoalReached ? 'Objectif atteint' : ''} {isGoalReached && isDeadlinePassed ? 'et' : ''} {isDeadlinePassed ? 'Date limite dépassée' : ''} {cagnotte.participantLimit && nbContribs >= cagnotte.participantLimit ? `Limite de participants (${cagnotte.participantLimit}) atteinte` : ''}.
                    La cagnotte sera fermée automatiquement et vous pourrez retirer les fonds.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div style={{ display: "flex", gap: "8px" }}>
              <span
                className="px-3 py-1 rounded-full text-white text-xs font-semibold shadow inline-flex items-center whitespace-nowrap"
                style={{
                  backgroundColor:
                    cagnotte.status === "active"
                      ? colors.primary
                      : cagnotte.status === "closed"
                        ? "#DC2626"
                        : "#FBBF24",
                }}
              >
                <span style={{ color: cagnotte.status === "closed" ? "#FFFFFF" : "white" }}>
                  {cagnotte.status
                    ? cagnotte.status[0].toUpperCase() + cagnotte.status.slice(1)
                    : "Inconnu"}
                </span>

                {" | "}

                {cagnotte.type === "private" ? "🔒 Privé" : "🌍 Public"}
              </span>

              {cagnotte.type === "private" && !isOwner && (
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                  👁️ Accès limité
                </span>
              )}
            </div>

            <div className="flex gap-[10px]">
              {cagnotte.status !== 'closed' && (
                <button
                  onClick={() => navigate(`/contribute/${cagnotte.id}`)}
                  className="px-4 py-2 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                  style={{ backgroundColor: colors.primary }}
                >
                  Contribuer
                </button>
              )}
              <button
                onClick={() => navigate(`/contributors/${cagnotte.id}`)}
                className="px-2 py-1 text-white font-semibold rounded-md shadow hover:opacity-90 transition text-sm"
                style={{ backgroundColor: colors.primary }}
              >
                Voir les contributeurs
              </button>
              {currentUserData && isOwner && (
                <>
                  {cagnotte.status === 'active' && !(isGoalReached || isDeadlinePassed || (cagnotte.participantLimit && nbContribs >= cagnotte.participantLimit)) && (
                    <button
                      onClick={async () => {
                        if (!window.confirm('Êtes-vous sûr de vouloir fermer cette cagnotte ? Elle n\'acceptera plus de contributions.')) return;
                        try {
                          await api.put(`/pulls/${cagnotte.id}`, { status: 'closed' });
                          setRefreshKey(prev => prev + 1);
                          alert('Cagnotte fermée avec succès');
                        } catch (error) {
                          console.error('Erreur lors de la fermeture:', error);
                          alert('Erreur lors de la fermeture de la cagnotte');
                        }
                      }}
                      className="px-4 py-2 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                      style={{ backgroundColor: '#F87171' }}
                    >
                      Fermer la cagnotte
                    </button>
                  )}
                  {cagnotte.status === 'closed' && (
                    <button
                      disabled
                      className="px-4 py-1 bg-red-600 text-white font-semibold rounded-md shadow cursor-not-allowed opacity-75 text-sm"
                      style={{ backgroundColor: '#DC2626' }}
                    >
                      Cagnotte fermée
                    </button>
                  )}
                  {canWithdrawWithoutKyc && !kycLoading && (
                    <>
                      {!hasApprovedKyc ? (
                        <div className="px-5 py-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md">
                          <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <div>
                              <p className="font-semibold">Vérification d'identité requise</p>
                              <p className="text-sm">Vous devez soumettre et faire valider vos documents KYC avant de pouvoir retirer des fonds.</p>
                              <button
                                onClick={() => navigate('/kyc')}
                                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                              >
                                Soumettre KYC
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/cagnottes/${cagnotte.id}/withdraw`)}
                          className="px-4 py-2 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          Retirer les fonds ({calculatedCurrentAmount} {cagnotte.currency} disponible)
                        </button>
                      )}
                    </>
                  )}
                  {cagnotte.status === 'active' && (
                    <button
                      onClick={() => navigate(`/edit-cagnotte/${cagnotte.id}`)}
                      className="px-4 py-2 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      Modifier
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          <div style={{ marginTop: 10 }}>
            {cagnotte.type === "private" && !isOwner ? (
              <div className="w-full bg-gray-200 rounded-full h-5 opacity-50">
                <div
                  className="h-5 rounded-full bg-gray-400"
                  style={{ width: '30%' }}
                />
              </div>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-5">
                <div
                  className="h-5 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </div>
            )}
            <p className="text-right text-gray-700 font-semibold mt-[4px]">
              {cagnotte.type === "private" && !isOwner ? "Progression masquée" : `${progress.toFixed(1)}%`}
            </p>
          </div>

          {/* Infos */}
          <div className="grid grid-cols-2 gap-6 text-lg font-medium mb-5">
            <div className="flex items-center gap-2">
              {cagnotte.creator?.avatarUrl && (
                <img
                  src={cagnotte.creator.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <span>
                <strong>Créateur :</strong> {cagnotte.owner?.name || cagnotte.creator?.name || "Utilisateur"}
              </span>
            </div>
            <p><strong>Date création :</strong> {creationDate.toLocaleDateString()}</p>
            <p><strong>Jours écoulés :</strong> {daysElapsed} jours</p>
            <p><strong>Date limite :</strong> {cagnotte.deadline ? new Date(cagnotte.deadline).toLocaleDateString() : 'Aucune limite'}</p>
            <p><strong>Contributeurs :</strong> {cagnotte.type === "private" && !isOwner ? "Masqué" : nbContribs}</p>
            <p><strong>Don moyen :</strong> {cagnotte.type === "private" && !isOwner ? "Masqué" : `${avgDonation.toFixed(2)} ${cagnotte.currency}`}</p>
            <p><strong>Montant restant :</strong> {cagnotte.type === "private" && !isOwner ? "Masqué" : `${remain.toLocaleString()} ${cagnotte.currency}`}</p>
            <p><strong>Montant collecté :</strong> {cagnotte.type === "private" && !isOwner ? "Masqué" : `${calculatedCurrentAmount.toLocaleString()} ${cagnotte.currency}`}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 border-b pb-1">Description</h2>
            <p style={{ color: "#4b5563" }}>
              {cagnotte.type === "private" && !isOwner
                ? "Description disponible pour les propriétaires uniquement"
                : cagnotte.description
              }
            </p>
          </div>

          {/* Contributeurs */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 border-b pb-1">Contributeurs</h2>
            {allContribs.length === 0 ? (
              <p className="text-gray-500">Aucun contributeur pour le moment.</p>
            ) : cagnotte.type === "private" && !isOwner ? (
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                <p className="text-gray-600">
                  🔒 Liste des contributeurs masquée pour les cagnottes privées.
                  Seuls les propriétaires peuvent voir les détails complets.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Nombre total de contributeurs: {allContribs.length}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner space-y-3">
                {currentList.map((c) => (
                  <div key={c.id} className="border-b last:border-b-0 pb-2">
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <span>{c.anonymous ? "Anonyme" : c.contributor?.name || c.user?.name || "Utilisateur"}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-blue-600 font-semibold">{c.amount.toLocaleString()} {cagnotte.currency}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic mt-1">
                      {c.message ? `“${c.message}”` : "Aucun message, soyez le premier à soutenir !"}
                    </p>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between mt-4 items-center">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
                  >
                    Précédent
                  </button>
                  <span className="font-semibold">{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded text-white disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Partage et réseaux */}
          <div className="flex flex-col md:flex-row items-center gap-4 mt-2 p-4 border rounded-lg bg-gray-50">
            <QRCode value={shareLink} size={120} />
            <div className="flex flex-col items-start gap-2 ml-4 relative">
              <p className="break-all text-gray-700">{shareLink}</p>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition"
                style={{ backgroundColor: colors.primary }}
              >
                Copier le lien
              </button>

              {/* Bouton + Réseaux sur la même ligne */}
              <div className="flex items-center gap-3 mt-2">
                {/* Indicateur visuel (non cliquable) */}
                <div
                  className="p-2 rounded-md flex items-center gap-1 bg-gray-100"
                  title="Partager via réseaux"
                >
                  <FiShare2 size={20} />
                  <span className="text-gray-700 font-medium">Partager</span>
                </div>

                {/* Boutons réseaux (cliquables) */}
                <button
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`, "_blank")}
                  className="p-2 rounded bg-green-500 text-white text-xl hover:opacity-80 transition"
                  title="WhatsApp"
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, "_blank")}
                  className="p-2 rounded bg-blue-700 text-white text-xl hover:opacity-80 transition"
                  title="Facebook"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => window.location.href = `mailto:?subject=Découvrez cette cagnotte&body=${encodeURIComponent(shareLink)}`}
                  className="p-2 rounded bg-gray-700 text-white text-xl hover:opacity-80 transition"
                  title="Email"
                >
                  <FaEnvelope />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CagnotteDetails;







