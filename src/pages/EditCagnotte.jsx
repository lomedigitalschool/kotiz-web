import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";

const EditCagnotte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cagnotte, fetchCagnotte, updateCagnotte } = useCagnotteStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    status: "active",
    type: "public",
    deadline: "",
    currency: "FCFA",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Charger la cagnotte
  useEffect(() => {
    if (!cagnotte || cagnotte.id !== Number(id)) {
      fetchCagnotte(Number(id));
    } else {
      setFormData({
        title: cagnotte.title || "",
        description: cagnotte.description || "",
        goalAmount: cagnotte.goalAmount || "",
        status: cagnotte.status || "active",
        type: cagnotte.type || "public",
        deadline: cagnotte.deadline
          ? new Date(cagnotte.deadline).toISOString().split("T")[0]
          : "",
        currency: cagnotte.currency || "FCFA",
      });
    }
  }, [id, cagnotte, fetchCagnotte]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setErrorMsg("");
    const today = new Date().toISOString().split("T")[0];

    if (!formData.title.trim()) return setErrorMsg("Titre obligatoire") || false;
    if (!formData.description.trim()) return setErrorMsg("Description obligatoire") || false;
    if (!formData.goalAmount || Number(formData.goalAmount) <= 0) return setErrorMsg("Montant > 0") || false;
    if (!formData.deadline) return setErrorMsg("Date limite obligatoire") || false;
    if (formData.deadline <= today) return setErrorMsg("La date limite doit être future") || false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // simulation API
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateCagnotte({ ...cagnotte, ...formData });
      setSuccessMsg("Cagnotte modifiée avec succès !");
      setTimeout(() => navigate(`/cagnottes/${id}`), 1000);
    } catch (err) {
      setErrorMsg("Erreur lors de la modification. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-roboto">
      <h1 className="text-3xl font-bold mb-6">Modifier la cagnotte</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">

        {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}

        {/* Titre */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
            style={{ outline: "none" }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
            required
            style={{ outline: "none" }}
          />
        </div>

        {/* Montant objectif et date limite */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Montant objectif</label>
            <input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Date limite</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Statut et type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="closed">Clôturée</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-md text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#EF4444" }}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-md text-white hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary }}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCagnotte;



