import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../config/firebase";
import api from "../services/api";
import DatePicker from "../components/DatePicker";

const EditCagnotte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cagnotte, fetchCagnotte, updateCagnotte, fetchUserCagnottes } = useCagnotteStore();

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Charger la cagnotte et vérifier la propriété
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!cagnotte || cagnotte.id !== Number(id)) {
      console.log('Chargement de la cagnotte depuis l\'API:', id);
      const loadCagnotte = async () => {
        const loadedCagnotte = await fetchCagnotte(Number(id));
        if (loadedCagnotte) {
          // Vérifier que l'utilisateur est propriétaire
          console.log('🔍 Vérification propriétaire (API):');
          console.log('  - loadedCagnotte.userId:', loadedCagnotte.userId);
          console.log('  - user.id:', user.id);
          console.log('  - loadedCagnotte.owner?.id:', loadedCagnotte.owner?.id);
          console.log('  - loadedCagnotte:', loadedCagnotte);
          
          if (loadedCagnotte.userId !== user.id && loadedCagnotte.owner?.id !== user.id) {
            console.log('❌ Pas propriétaire - accès refusé (API)');
            alert('Vous n\'avez pas l\'autorisation de modifier cette cagnotte.');
            navigate('/dashboard');
            return;
          }
          
          console.log('✅ Utilisateur propriétaire confirmé (API)');
          
          const formDataToSet = {
            title: loadedCagnotte.title || "",
            description: loadedCagnotte.description || "",
            goalAmount: loadedCagnotte.goalAmount || "",
            status: loadedCagnotte.status || "active",
            type: loadedCagnotte.type || "public",
            deadline: loadedCagnotte.deadline ? new Date(loadedCagnotte.deadline) : null,
            currency: loadedCagnotte.currency || "FCFA",
          };
          console.log('Données du formulaire initialisées depuis l\'API:', formDataToSet);
          setFormData(formDataToSet);
        }
      };
      loadCagnotte();
    } else {
      console.log('Cagnotte déjà chargée:', cagnotte);
      // Vérifier que l'utilisateur est propriétaire
      console.log('🔍 Vérification propriétaire (store):');
      console.log('  - cagnotte.userId:', cagnotte.userId);
      console.log('  - user.id:', user.id);
      console.log('  - cagnotte.owner?.id:', cagnotte.owner?.id);
      console.log('  - cagnotte:', cagnotte);
      
      if (cagnotte.userId !== user.id && cagnotte.owner?.id !== user.id) {
        console.log('❌ Pas propriétaire - accès refusé (store)');
        alert('Vous n\'avez pas l\'autorisation de modifier cette cagnotte.');
        navigate('/dashboard');
        return;
      }
      
      console.log('✅ Utilisateur propriétaire confirmé (store)');
      
      const formDataToSet = {
        title: cagnotte.title || "",
        description: cagnotte.description || "",
        goalAmount: cagnotte.goalAmount || "",
        status: cagnotte.status || "active",
        type: cagnotte.type || "public",
        deadline: cagnotte.deadline ? new Date(cagnotte.deadline) : null,
        currency: cagnotte.currency || "FCFA",
      };
      console.log('Données du formulaire initialisées depuis le store:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [id, cagnotte, fetchCagnotte, user, navigate]);

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
    if (formData.deadline <= new Date()) return setErrorMsg("La date limite doit être future") || false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Préparer les données pour l'API (même format que le backend attend)
      const updateData = {
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        currency: formData.currency,
        deadline: formData.deadline ? formData.deadline.toISOString() : null,
        type: formData.type,
        status: formData.status
      };

      console.log('Données à envoyer pour mise à jour:', updateData);
      console.log('ID de la cagnotte:', id);
      console.log('URL de l\'API:', `/pulls/${id}`);
      
      // Vérifier le token Firebase avant l'appel
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        console.log('🔑 Token Firebase prêt:', token.substring(0, 50) + '...');
        console.log('👤 Utilisateur Firebase:', {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          emailVerified: auth.currentUser.emailVerified
        });
      } else {
        console.error('❌ Aucun utilisateur Firebase connecté');
      }

      // Appel API pour mettre à jour la cagnotte
      const response = await api.put(`/pulls/${id}`, updateData);

      console.log('Réponse de l\'API:', response);
      console.log('Status de la réponse:', response.status);
      console.log('Données de la réponse:', response.data);

      if (response.data) {
        // Mettre à jour le store local avec les nouvelles données
        const updatedCagnotte = response.data.pull || response.data;
        updateCagnotte(updatedCagnotte);
        
        // Rafraîchir les données utilisateur pour le dashboard (comme dans createCagnotte)
        try {
          console.log('🔄 Début du rafraîchissement des données...');
          await fetchUserCagnottes();
          await useCagnotteStore.getState().fetchUserContributions();
          
          // Forcer aussi le rafraîchissement de toutes les cagnottes
          await useCagnotteStore.getState().fetchAllCagnottes();
          
          console.log('✅ Données utilisateur rafraîchies après modification de cagnotte');
          
          // Vérifier que la cagnotte est bien mise à jour dans le store
          const updatedStore = useCagnotteStore.getState();
          const updatedCagnotteInStore = updatedStore.cagnottes.find(c => c.id === Number(id));
          console.log('Cagnotte mise à jour dans le store:', updatedCagnotteInStore);
          
        } catch (refreshError) {
          console.warn('⚠️ Erreur lors du rafraîchissement:', refreshError);
        }
        
        setSuccessMsg("Cagnotte modifiée avec succès !");

        // Rediriger après un court délai avec indication de modification
        setTimeout(() => {
          console.log('Redirection vers:', `/cagnottes/${id}`);
          navigate(`/cagnottes/${id}`, {
            state: { fromEdit: true, timestamp: Date.now() }
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      console.error('Status de l\'erreur:', err.response?.status);
      console.error('Données de l\'erreur:', err.response?.data);
      console.error('Config de la requête:', err.config);
      
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Erreur lors de la modification. Veuillez réessayer.";
      setErrorMsg(errorMessage);
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
            <DatePicker
              selected={formData.deadline}
              onChange={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
              minDate={new Date()}
              required
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
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 rounded-md text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#DC2626" }}
            disabled={loading}
          >
            Supprimer
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 rounded-md text-white hover:opacity-90 transition"
              style={{ backgroundColor: "#6B7280" }}
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
        </div>
      </form>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmation de suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement la cagnotte "{formData.title}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  try {
                    await api.delete(`/pulls/${id}`);
                    navigate('/dashboard');
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCagnotte;



