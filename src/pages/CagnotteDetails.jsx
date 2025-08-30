import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import QRCode from "react-qr-code";
import { colors } from "../theme/colors";
import { useCagnotteStore } from "../stores/cagnotteStore";

const ITEMS_PER_PAGE = 3;

const CagnotteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cagnotte, setCagnotte] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useCagnotteStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCagnotteDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/cagnottes/${id}`);
        setCagnotte(response.data);
        
        // Récupérer les contributions
        const contributionsResponse = await api.get(`/cagnottes/${id}/contributions`);
        setContributions(contributionsResponse.data);
        
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement de la cagnotte");
      } finally {
        setLoading(false);
      }
    };

    fetchCagnotteDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-[80px] text-gray-500">Chargement...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: 80, color: "#ef4444" }}>{error}</p>;
  if (!cagnotte) return <p className="text-center mt-20 text-gray-500">Cagnotte introuvable...</p>;

  // accès utilisateur
  const userId = currentUser?.id;
  const canAccess = cagnotte.type === "public" || cagnotte.userId === userId;
  if (!canAccess) return <p className="text-center mt-16 text-red-500">Accès restreint</p>;

  const progress = Math.min((cagnotte.collectedAmount / cagnotte.goalAmount) * 100, 100);

  // stats
  const allContribs = contributions.filter(c => c.cagnotteId === cagnotte.id);
  const totalPages = Math.ceil(allContribs.length / ITEMS_PER_PAGE);
  const currentList = allContribs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const nbContribs = allContribs.length;
  const avgDonation = allContribs.reduce((acc, c) => acc + c.amount, 0) / (nbContribs || 1);
  const remain = Math.max(cagnotte.goalAmount - cagnotte.collectedAmount, 0);

  const creationDate = new Date(cagnotte.createdAt);
  const daysElapsed = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cagnotte.shareLink);
    alert("Lien copié !");
  };

  return (
    <div className="p-5 font-roboto max-w-6xl mx-auto">
      <div className="bg-white rounded-[18px] shadow-lg overflow-hidden">
        <div>
          <img
            src={cagnotte.imageUrl}
            alt={cagnotte.title}
            className="w-full h-64 object-cover rounded-md mb-3"
            loading="lazy"
          />
        </div>

        <div className="p-6 space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: "#1f2937" }}>
            {cagnotte.title}
          </h1>

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
                {cagnotte.status[0].toUpperCase() + cagnotte.status.slice(1)}
              </span>

              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold shadow"
                style={{ backgroundColor: cagnotte.type === "public" ? "#3B5BAB" : "#F59E0B" }}
              >
                {cagnotte.type[0].toUpperCase() + cagnotte.type.slice(1)}
              </span>
            </div>

            <div className="flex gap-[10px]">
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
              <button
                onClick={() => navigate(`/contributors/${cagnotte.id}`)}
                className="px-5 py-3 text-white font-semibold rounded-md shadow hover:opacity-90 transition"
                style={{ backgroundColor: colors.primary }}
              >
                Voir les contributeurs
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div style={{ marginTop: 10 }}>
            <div className="w-full bg-gray-200 rounded-full h-5">
              <div
                className="h-5 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </div>
            <p className="text-right text-gray-700 font-semibold mt-[4px]">
              {progress.toFixed(1)}%
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
                <strong>Créateur :</strong> {cagnotte.creator?.name || "—"}
              </span>
            </div>
            <p><strong>Date création :</strong> {creationDate.toLocaleDateString()}</p>
            <p><strong>Jours écoulés :</strong> {daysElapsed} jours</p>
            <p><strong>Date limite :</strong> {new Date(cagnotte.deadline).toLocaleDateString()}</p>
            <p><strong>Contributeurs :</strong> {nbContribs}</p>
            <p><strong>Don moyen :</strong> {avgDonation.toFixed(2)} {cagnotte.currency}</p>
            <p><strong>Montant restant :</strong> {remain.toLocaleString()} {cagnotte.currency}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 border-b pb-1">Description</h2>
            <p style={{ color: "#4b5563" }}>{cagnotte.description}</p>
          </div>

          {/* Contributeurs */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 border-b pb-1">Contributeurs</h2>
            {allContribs.length === 0 ? (
              <p className="text-gray-500">Aucun contributeur pour le moment.</p>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner space-y-3">
                {currentList.map((c) => (
                  <div key={c.id} className="border-b last:border-b-0 pb-2">
                    <div className="flex justify-between text-gray-800 font-medium">
                      <span>{c.anonymous ? "Anonyme" : c.user || "Utilisateur"}</span>
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

          {/* Partage */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 border-b pb-1">Partager cette cagnotte</h2>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-2">
              <QRCode value={cagnotte.shareLink} size={120} />
              <div className="flex flex-col gap-2">
                <p className="break-all text-gray-700">{cagnotte.shareLink}</p>
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-2 text-white rounded-md hover:opacity-90 transition"
                  style={{ backgroundColor: colors.primary }}
                >
                  Copier le lien
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







