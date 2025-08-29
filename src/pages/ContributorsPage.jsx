import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { FaArrowLeft } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const ContributorsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cagnottes, contributions, fetchAllCagnottes, fetchUserContributions, loading, error } = useCagnotteStore();
  const [page, setPage] = useState(1);
  const [cContributors, setCContributors] = useState([])  ;
  const [cagnotte, setCagnotte] = useState(null);

  // Charger les données
  useEffect(() => {
    fetchAllCagnottes();
    fetchUserContributions();
  }, [fetchAllCagnottes,  fetchUserContributions]);

  useEffect(() => {
    const foundCagnotte = cagnottes.find(c => c.id === parseInt  (id));
    setCagnotte(foundCagnotte);

    const filteredContribs = contributions.filter(contrib => contrib.cagnotteId === parseInt(id));
    setCContributors  (filteredContribs);
    setPage(1);
  }, [id, cagnottes, contributions]);

  if (loading)  return <p style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}> Chargement...</p> ;
  if (error) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#dc2626" }}>{error}</p>;
  if (!cagnotte) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}>Cagnotte introuvable.</p>;

  const totalPages = Math.ceil(cContributors.length / ITEMS_PER_PAGE);
  const currentContributors = cContributors.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 mx-auto relative" style={{ maxWidth: "900px", fontFamily: "Roboto, sans-serif" }}>


      {/* Bouton retour */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <FaArrowLeft size={20} className="text-gray-700" />
      </button>

      <h1 className="text-4xl font-bold mb-2 text-gray-800 text-center">
        Contributeurs de "{cagnotte.title}"
      </h1>
      <p className="text-gray-600 mb-6 text-center">{cContributors.length} contributeurs</p>

      <div className="flex flex-col gap-2">


        {currentContributors.map(contrib => (
          <div
            key={contrib.id}
            className="flex justify-between items-center px-4 py-2 rounded text-sm"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis" }}>
              {contrib.anonymous ? "Anonyme" : contrib.user}
            </span>
            <span className="font-semibold">{contrib.amount.toLocaleString()} {contrib.currency}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 transition-colors"
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
                 )}

    </div>
  );

};

export default ContributorsPage;

;


