import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import QRCode from "react-qr-code";
import { colors } from "../theme/colors";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { useAuth } from "../hooks/useAuth";
import { FaFacebook, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

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

  useEffect(() => {
    const fetchCagnotteDetails = async () => {
      try {
        setLoading(true);
        console.log('Chargement de la cagnotte:', id, 'Refresh key:', refreshKey);

        // Utiliser l'endpoint unifié qui gère l'accès selon l'authentification
        const response = await api.get(`/pulls/${id}`);
        console.log('Cagnotte chargée:', response.data);

        // Traiter les données reçues
        const cagnotteData = response.data.data || response.data;
        console.log('Données complètes de l\'API:', cagnotteData);

        setCagnotte(cagnotteData);

        // Fetch contributions separately
        try {
          const contribResponse = await api.get(`/pulls/${id}/contributions`);
          console.log('Contributions chargées:', contribResponse.data);
          const contribs = contribResponse.data.data || contribResponse.data || [];
          console.log('Contributions à définir:', contribs);
          setContributions(contribs);
        } catch (contribError) {
          console.error('Erreur lors du chargement des contributions:', contribError);
          setContributions([]);
        }

        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);

        // Gestion spécifique des erreurs d'accès
        if (err.response?.status === 403) {
          setError("Accès refusé - Cette cagnotte est privée. Connectez-vous avec le compte propriétaire pour y accéder.");
        } else if (err.response?.status === 404) {
          setError("Cagnotte non trouvée");
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
  
  // Rafraîchir automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Rafraîchissement automatique des détails de la cagnotte');
      setRefreshKey(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Retour sur la page, rafraîchissement');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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

  if (loading) return <p className="text-center mt-[80px] text-gray-500">Chargement...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: 80, color: "#ef4444" }}>{error}</p>;
  if (!cagnotte) return <p className="text-center mt-20 text-gray-500">Cagnotte introuvable...</p>;

  if (userLoading) return <p className="text-center mt-[80px] text-gray-500">Vérification des accès...</p>;

  const userId = currentUserData?.id;
  // Le backend contrôle déjà l'accès, donc si on arrive ici c'est qu'on a accès
  // Mais on peut utiliser isOwner pour afficher des informations supplémentaires
  const isOwner = cagnotte.isOwner || (cagnotte.userId === userId) || (cagnotte.owner?.id === userId);

  const progress = Math.min(((cagnotte.currentAmount || 0) / cagnotte.goalAmount) * 100, 100);

  // Vérifier les conditions pour le retrait
  const currentAmount = cagnotte.currentAmount || 0;
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
  const allContribs = contributions.filter(c => c.cagnotteId?.toString() === cagnotte.id?.toString());
  console.log('allContribs après filtrage:', allContribs);
  const totalPages = Math.ceil(allContribs.length / ITEMS_PER_PAGE);
  const currentList = allContribs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const nbContribs = allContribs.length;
  const avgDonation = allContribs.reduce((acc, c) => acc + c.amount, 0) / (nbContribs || 1);
  const remain = Math.max(cagnotte.goalAmount - (cagnotte.currentAmount || 0), 0);

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

          {/* Notification pour le propriétaire quand les conditions de retrait sont remplies */}
          {isOwner && canWithdraw && cagnotte.status === 'active' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <strong>Conditions de retrait remplies :</strong> {isGoalReached ? 'Objectif atteint' : ''} {isGoalReached && isDeadlinePassed ? 'et' : ''} {isDeadlinePassed ? 'Date limite dépassée' : ''}.
                    Vous pouvez maintenant fermer la cagnotte et retirer les fonds.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div style={{ display: "flex", gap: "8px" }}>
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold shadow"
                style={{
                  backgroundColor:
                    cagnotte.status === "active"
                      ? colors.primary
                      : cagnotte.status === "closed"
                        ? "#F87171"
                        : "#FBBF24",
                }}
              >
                {cagnotte.status
                  ? cagnotte.status[0].toUpperCase() + cagnotte.status.slice(1)
                  : "Inconnu"}

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
                  style={{
                    backgroundColor: colors.primary,
                    padding: "12px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    fontWeight: "600",
                  }}
                  className="shadow hover:opacity-90 transition"
                >
                  Contribuer
                </button>
              )}
              <button
                onClick={() => navigate(`/contributors/${cagnotte.id}`)}
                className="px-5 py-3 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                style={{ backgroundColor: colors.primary }}
              >
                Voir les contributeurs
              </button>
              {currentUserData && isOwner && (
                <>
                  {cagnotte.status === 'active' && (
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
                      className="px-5 py-3 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                      style={{ backgroundColor: '#F87171' }}
                    >
                      Fermer la cagnotte
                    </button>
                  )}
                  {cagnotte.status === 'closed' && (
                    <span className="px-5 py-3 bg-gray-500 text-white font-semibold rounded-md">
                      Cagnotte fermée
                    </span>
                  )}
                  {canWithdrawWithoutKyc && (
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
                                className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition"
                              >
                                Soumettre KYC
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            const amount = prompt(`Montant à retirer (max: ${cagnotte.currentAmount || 0} ${cagnotte.currency}):`);
                            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

                            if (parseFloat(amount) > (cagnotte.currentAmount || 0)) {
                              alert('Montant supérieur au solde disponible');
                              return;
                            }

                            if (!confirm(`Confirmer le retrait de ${amount} ${cagnotte.currency} ?`)) return;

                            try {
                              const response = await api.post(`/pulls/${cagnotte.id}/withdraw`, {
                                amount: parseFloat(amount),
                                reason: 'Retrait par le propriétaire'
                              });

                              if (response.data.success) {
                                alert(`Retrait de ${amount} ${cagnotte.currency} effectué avec succès!\nRéférence: ${response.data.withdrawal.transactionReference}`);
                                setRefreshKey(prev => prev + 1);
                              }
                            } catch (error) {
                              console.error('Erreur retrait:', error);
                              alert('Erreur lors du retrait: ' + (error.response?.data?.error || error.message));
                            }
                          }}
                          className="px-5 py-3 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          Retirer les fonds ({cagnotte.currentAmount || 0} {cagnotte.currency} disponible)
                        </button>
                      )}
                    </>
                  )}
                  {cagnotte.status === 'active' && (
                    <button
                      onClick={() => navigate(`/edit-cagnotte/${cagnotte.id}`)}
                      className="px-5 py-3 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
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
            <p><strong>Montant collecté :</strong> {cagnotte.type === "private" && !isOwner ? "Masqué" : `${(cagnotte.currentAmount || 0).toLocaleString()} ${cagnotte.currency}`}</p>
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
                    <div className="flex justify-between text-gray-800 font-medium">
                      <span>{c.anonymous ? "Anonyme" : c.contributor?.name || c.user?.name || "Utilisateur"}</span>
                      <span>{c.amount.toLocaleString()} {cagnotte.currency}</span>
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
                className="px-6 py-2 text-white rounded-md hover:opacity-90 transition"
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







