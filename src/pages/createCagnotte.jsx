import React, { useState } from "react";
import LandingPage from "./LandingPage";
import api from "../services/api";
import illustration from "../assets/illustrations/_Cagnotte Digitale Amicale_simple_compose.png";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaUser } from "react-icons/fa";


const CreerCagnotte = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    currency: "XOF",
    deadline: "",
    type: "public",
    participantLimit: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.title.trim()) newErrors.title = "Le titre de la cagnotte est obligatoire.";
      if (!form.description.trim()) newErrors.description = "La description est obligatoire.";
    } else if (step === 2) {
      if (!form.goalAmount || isNaN(form.goalAmount) || parseFloat(form.goalAmount) <= 0) {
        newErrors.goalAmount = "Un montant cible valide est obligatoire.";
      }
    } else if (step === 3) {
      if (!form.type) newErrors.type = "Le type de cagnotte est obligatoire.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    setErrors({ ...errors, [e.target.name]: "" });
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du type de fichier côté client
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        if (file.type === 'image/avif') {
          alert(`Format AVIF non supporté par notre service de stockage. Utilisez JPG, PNG, GIF, WEBP, SVG, BMP ou TIFF.`);
        } else {
          alert(`Type de fichier non supporté: ${file.type}. Utilisez JPG, PNG, GIF, WEBP, SVG, BMP ou TIFF.`);
        }
        e.target.value = ''; // Reset le champ file
        return;
      }

      if (file.size > maxSize) {
        alert(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB. Taille maximale: 10MB.`);
        e.target.value = ''; // Reset le champ file
        return;
      }

      setForm({ ...form, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm({ ...form, imageFile: null });
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vous devez être connecté pour créer une cagnotte. Veuillez vous connecter d'abord.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      // Conversion et validation des données
      const processedData = {
        title: form.title,
        description: form.description,
        goalAmount: parseFloat(form.goalAmount) || 0,
        currency: form.currency,
        deadline: form.deadline || null,
        type: form.type,
        participantLimit: form.participantLimit ? parseInt(form.participantLimit) : null
      };

      // Ajout des données traitées
      Object.keys(processedData).forEach(key => {
        if (processedData[key] !== null && processedData[key] !== undefined) {
          formData.append(key, processedData[key]);
        }
      });

      // Ajout de l'image si elle existe
      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      console.log('Données envoyées:', Object.fromEntries(formData));

      // Envoi à l'API
      const response = await api.post('/pulls', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        // Mettre à jour le store local
        useCagnotteStore.getState().addCagnotte(response.data);

        alert("🎉 Cagnotte créée avec succès !");

        // Reset formulaire
        setForm({
          title: "",
          description: "",
          goalAmount: "",
          currency: "XOF",
          deadline: "",
          type: "public",
          participantLimit: "",
          imageFile: null,
        });
        setPreview(null);

        navigate("/dashboard");
      }

      setIsSubmitting(false);

    } catch (error) {
      console.error("Erreur détaillée:", error);
      console.error("Données de la réponse:", error.response?.data);
      console.error("Status:", error.response?.status);

      let errorMessage = "Une erreur est survenue lors de la création de la cagnotte.";

      if (error.response?.status === 401) {
        errorMessage = "Vous devez être connecté pour créer une cagnotte. Veuillez vous reconnecter.";
      } else if (error.response?.status === 400) {
        // Gestion spécifique des erreurs d'upload
        if (error.response?.data?.error === 'Type de fichier non supporté') {
          errorMessage = error.response.data.message || "Type d'image non supporté. Utilisez JPG, PNG, GIF, WEBP, SVG, BMP ou TIFF.";
        } else if (error.response?.data?.error === 'Fichier trop volumineux') {
          errorMessage = error.response.data.message || "L'image est trop volumineuse. Taille maximale: 10MB.";
        } else {
          errorMessage = "Données invalides. Vérifiez que tous les champs requis sont remplis correctement.";
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">
      {/* Header */}
      <header className="w-full border-b border-[#e5e8ea] flex items-center justify-between px-10 py-4 bg-white">
        <img
          src="/src/assets/logos/logo_horizontale.png"
          alt="Logo horizontal"
          className="w-40 cursor-pointer"
          onClick={() => navigate("/landing")}
        />
        <nav className="flex gap-6 text-base font-medium">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-black hover:text-[#4ac260] transition-colors"
          >
            <FaHome className="text-lg text-green-200 opacity-60" /> Accueil
          </button>
          <button
            onClick={() => navigate("/explorePage")}
            className="flex items-center gap-2 text-black hover:text-[#4ac260] transition-colors"
          >
            <FaSearch className="text-lg text-green-200 opacity-60" /> Explorer
          </button>
          <button
            onClick={() => navigate("/profil")}
            className="flex items-center gap-2 text-black hover:text-[#4ac260] transition-colors"
          >
            <FaUser className="text-lg text-green-200 opacity-60" /> Profil
          </button>
        </nav>

      </header>

      <main className="flex w-full max-w-6xl bg-white rounded-2xl shadow-lg mt-10 overflow-hidden">
        {/* Illustration gauche */}
        <div className="hidden md:flex flex-1 bg-[#f7f9fc] items-center justify-center p-0">
          <img src={illustration} alt="Créer une cagnotte" className="w-3/4" />
        </div>

        {/* Formulaire droite */}

        <div className="flex-1 p-10">
          <h2 className="text-3xl font-bold text-[#4ca260] mb-4">Créer une cagnotte 💰</h2>
          <p className="text-gray-600 mb-6">
            Lancez votre collecte en quelques étapes simples.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-[#4ca260] h-2.5 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 1: Informations de base</h3>
                <div>
                  <label className="block font-medium text-gray-700">
                    Nom de la cagnotte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                    placeholder="Ex: Anniversaire de Marie"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                    placeholder="Expliquez l'objectif de votre cagnotte..."
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition"
                >
                  Suivant
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 2: Montant et durée</h3>
                <div>
                  <label className="block font-medium text-gray-700">
                    Montant cible <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="goalAmount"
                    required
                    value={form.goalAmount}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                    placeholder="Entrez le montant à collecter"
                  />
                  {errors.goalAmount && <p className="text-red-500 text-sm mt-1">{errors.goalAmount}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Devise</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                  >
                    <option value="XOF">FCFA (Franc CFA)</option>
                    <option value="GNF">GNF (Franc Guinéen)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Date de clôture</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition"
                  >
                    Suivant
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 3: Options avancées</h3>
                <div>
                  <label className="block font-medium text-gray-700">
                    Type de cagnotte <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                  >
                    <option value="public">Publique</option>
                    <option value="private">Privée</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    Limite de participants (optionnel)
                  </label>
                  <input
                    type="number"
                    name="participantLimit"
                    value={form.participantLimit}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
                    placeholder="Ex: 50"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Image de la cagnotte</label>
                  {preview ? (
                    <div className="mt-2 relative">
                      <img src={preview} alt="Aperçu" className="w-full h-40 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border border-dashed rounded-lg"
                    />
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition"
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`font-bold py-3 px-6 rounded-lg transition ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-[#4ca260] text-white hover:bg-[#082e11]"
                    }`}
                  >
                    {isSubmitting ? "Création en cours..." : "🚀 Lancer la cagnotte"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreerCagnotte;