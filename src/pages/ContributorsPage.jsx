import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";
import SkeletonLoader from "../components/SkeletonLoader";

const ITEMS_PER_PAGE = 10;

const ContributorsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCagnotte, fetchCagnotteContributions, loading, error } = useCagnotteStore();
  const [page, setPage] = useState(1);
  const [cContributors, setCContributors] = useState([])  ;
  const [cagnotte, setCagnotte] = useState(null);
  const [socket, setSocket] = useState(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      // Charger la cagnotte spécifique par ID (même si fermée pour le propriétaire)
      const cagnotteData = await fetchCagnotte(id);
      setCagnotte(cagnotteData);

      // Charger les contributions spécifiques à cette cagnotte
      const contributions = await fetchCagnotteContributions(id);
      setCContributors(contributions);
      setPage(1);
    };

    loadData();
  }, [id]); // ✅ Dépendances avec id pour recharger quand l'id change

  // Configuration Socket.io pour les mises à jour temps réel
  useEffect(() => {
    // Connexion Socket.io
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    // Rejoindre la room des mises à jour publiques
    newSocket.emit('join-public-updates');

    // Écouter les nouvelles contributions
    newSocket.on('contribution-completed', (data) => {
      console.log('🔄 Nouvelle contribution reçue:', data);

      // Si la contribution concerne cette cagnotte, rafraîchir les données
      if (data.pullId === parseInt(id)) {
        console.log('📊 Rafraîchissement des contributions pour cette cagnotte');
        fetchCagnotteContributions(id).then(contributions => {
          setCContributors(contributions);
        });
      }
    });

    setSocket(newSocket);

    // Nettoyage
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [id]);

  if (loading) return <SkeletonLoader type="default" />;
  if (error) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#dc2626" }}>{error}</p>;
  if (!cagnotte) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}>
        <p className="mb-4">Cette cagnotte n'existe pas ou n'est plus accessible.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/explorePage')}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Explorer les cagnottes
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(cContributors.length / ITEMS_PER_PAGE);
  const currentContributors = cContributors.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 mx-auto relative" style={{ maxWidth: "900px", fontFamily: "Roboto, sans-serif" }}>


      {/* Bouton retour */}
      <button
        onClick={() => navigate(`/cagnottes/${id}`)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <FaArrowLeft size={20} className="text-gray-700" />
      </button>

      <h1 className="text-4xl font-bold mb-2 text-gray-800 text-center">
        Contributeurs de "{cagnotte.title}"
      </h1>
      <p className="text-gray-600 mb-2 text-center">{cContributors.length} contributeurs</p>
      <p className="text-green-600 font-semibold mb-6 text-center">
        Total collecté: {cContributors.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0).toLocaleString()} {cagnotte.currency || 'XOF'}
      </p>

      <div className="flex flex-col gap-2">


        {currentContributors.map(contrib => (
          <div
            key={contrib.id}
            className="flex justify-between items-center px-4 py-2 rounded text-sm"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis" }}>
              {contrib.contributor?.name || contrib.contributorName || "Anonyme"}
            </span>
            <span className="font-semibold">{parseFloat(contrib.amount).toLocaleString()} {contrib.currency || 'XOF'}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-6 py-3 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Précédent
          </button>

          <span className="font-semibold">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}

            onClick={() => setPage(page + 1)}
            className="px-6 py-3 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            Suivant
          </button>
        </div>
                 )}

    </div>
  );

};

export default ContributorsPage;



