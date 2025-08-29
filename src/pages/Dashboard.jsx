import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { cagnottes, fetchAllCagnottes, contributions, fetchUserContributions, loading, error, deleteCagnotte } = useCagnotteStore();
  const [userStats, setUserStats] =useState({});

  useEffect(() => {

    fetchAllCagnottes();

    fetchUserContributions();

    const local = JSON.parse(  localStorage.getItem  ("localCagnottes"  ) || "[]");
    if (local.length) {
      const current = useCagnotteStore.getState().cagnottes;
      const merged = [...current, ...local.filter(l => !current.find(c => c.id === l.id))];
      useCagnotteStore.getState().setCagnottes(merged  );
    }
  }, [fetchAllCagnottes, fetchUserContributions]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#6b7280" }}>Chargement...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: "5rem", color: "#dc2626" }}>{error}</p>;

  const COLORS = ["#3B5BAB", "#4CA260", "#997A8D", "#806D5A", "#149414", "#4E3D28", "#BBD2E1", "#3A020D", "#C1BFB1", "#22780F", "#997A8D", "#40826D", "#BBACAC", "#5A5E6B", "#83A697"];

  return (
    <div className="p-6 mx-auto font-roboto" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <button
          onClick={() => navigate("/create-cagnotte")}
          className="px-6 py-2 rounded-md text-white hover:opacity-90 transition"
          style={{ backgroundColor: colors.primary }}
        >
          Créer une cagnotte
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Montants collectés</p>
          <p className="text-2xl font-bold">{userStats.totalCollected?.toLocaleString() || 0} FCFA  </p>
        </div>

        <div className="bg-white rounded-xl shadow   p-4 text-center">
          <p className="text-gray-500">Cagnottes actives</p>
          <p className="text-2xl font-bold">  {userStats.activeCount || 0}</p>
        </div>

        <div className="bg-white rounded- xl shadow p-4 text-center">
          <p className="text-gray-500">Nombre de contributeurs</p>
          <p className="text-2xl font-bold">{userStats.totalContributors || 0}  </p>
        </div>

      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-bold mb-2">Montants collectés par cagnotte</h2>
          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={cagnottes}>
              <XAxis dataKey="title"  />
              <YAxis />
              <Tooltip />
              <Bar dataKey="collectedAmount"  fill={colors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-bold mb-2">Répartition des contributions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cagnottes}
                dataKey="collectedAmount"
                nameKey="title"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={colors.secondary}
                label
              >
                {cagnottes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
      </div>

      {/* Mes cagnottes */}
      <h2 className="text-2xl font-bold mb-4">Mes Cagnottes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cagnottes.map(c => {
          const progress = Math.min((c.collectedAmount / c.goalAmount) * 100, 100);
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow p-6">
              <img src={c.imageUrl} alt={c.title} className="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
              <h3 className="text-xl font-bold mb-1">{c.title}</h3>
              <p className="text-gray-700 mb-2">{c.description}</p>

              {/* Type et statut */}
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Type: {c.type}</span>
                <span>Statut: {c.status}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div className="h-4 rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.primary }} />
              </div>
              <p className="text-right text-gray-700 font-semibold mb-2">
                {c.collectedAmount.toLocaleString()} / {c.goalAmount.toLocaleString()} {c.currency}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigate(`/cagnottes/${c.id}`)}
                  className="px-4 py-2 rounded-md text-white hover:opacity-90 transition"
                  style={{ backgroundColor: colors.secondary }}
                >
                  Voir détails
                </button>
                <button
                  onClick={() => navigate(`/edit-cagnotte/${c.id}`)}
                  className="px-4 py-2 rounded-md text-white hover:opacity-90 transition"
                  style={{ backgroundColor: colors.primary }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm(`Supprimer la cagnotte "${c.title}" ?`)) return;
                    deleteCagnotte(c.id);
                    alert(`Cagnotte "${c.title}" supprimée`);
                  }}
                  className="px-4 py-2 rounded-md text-white hover:opacity-90 transition"
                  style={{ backgroundColor: "#EF4444" }}
                >
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
                  <div
                    key={contrib.id}
                    className="flex justify-between items-center px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: "#f3f4f6" }}
                    title={contrib.anonymous ? "Anonyme" : contrib.user}
                  >
                    <span className="truncate">{contrib.anonymous ? "Anonyme" : contrib.user}</span>
                    <span className="font-semibold">{contrib.amount.toLocaleString()} {contrib.currency}</span>
                  </div>
                ))}
              </div>

              {cContributors.length > 3 && (
                <button
                  onClick={() => navigate(`/contributors/${c.id}`)}
                  className="mt-auto px-3 py-1 rounded text-white hover:opacity-90 transition text-sm"
                  style={{ backgroundColor: colors.primary }}
                >
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
                    {c.amount.toLocaleString()} {c.currency}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full ${c.anonymous ? "bg-gray-500" : ""}`}
                      style={{ backgroundColor: c.anonymous ? undefined : colors.primary }}
                    >
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
