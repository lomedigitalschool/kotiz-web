import api from "../services/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function KycFormForm() {
    const navigate = useNavigate();

    // On stocke toutes les informations du formulaire ici
    const [formData, setFormData] = useState({
        nomLegal: "",
        dateNaissance: "",
        adresse: "",
        nationalite: "",
        typePiece: "CNI",
        numeroPiece: "",
        dateExpiration: "",
        photoRecto: null,
        photoVerso: null,
    });

    const [loading, setLoading] = useState(false); // pour afficher le spinner ou état d'envoi
    const [message, setMessage] = useState(""); // message de retour à l'utilisateur
    const [confirmInfo, setConfirmInfo] = useState(false); // checkbox de confirmation

    // Fonction pour gérer les changements sur chaque champ
    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === "checkbox") {
            setConfirmInfo(checked); // checkbox confirmInfo
        } else if (files) {
            setFormData((prev) => ({ ...prev, [name]: files[0] })); // fichier upload
        } else {
            setFormData((prev) => ({ ...prev, [name]: value })); // champ texte/date/select
        }
    };

    // Fonction qui envoie le formulaire à l'API
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!confirmInfo) {
            alert("Vous devez confirmer que les informations sont exactes.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // Préparer les données à envoyer, y compris les fichiers
            const data = new FormData();
            for (const key in formData) {
                if (formData[key]) data.append(key, formData[key]);
            }

            // Appel réel à l'API
            const response = await api.post("/kyc", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Message positif
            setMessage("Votre demande KYC a été soumise avec succès !");
        } catch (error) {
            console.error("Erreur KYC:", error);
            setMessage("Une erreur est survenue lors de la soumission. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Header */}
            <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/landing")}
                >
                    <img
                        src="/src/assets/logos/logo_horizontale.png"
                        alt="Logo horizontal"
                        className="w-40"
                    />
                </div>

                {/* Bouton Dashboard avec flèche retour */}
                <div className="flex items-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 text-black hover:text-[#4CA260] transition font-semibold text-lg"
                    >
                        <FaArrowLeft className="h-6 w-6" />
                        Dashboard
                    </button>
                </div>
            </header>

            {/* Contenu KYC */}
            <div className="flex justify-center w-full py-10 px-4">
                <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10">

                    {/* Titre et description */}
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
                        Vérifier mon identité (KYC)
                    </h2>
                    <p className="text-gray-700 text-center mb-8 text-lg">
                        Pour assurer la sécurité de vos transactions et respecter les réglementations en vigueur, nous devons vérifier votre identité. Ce processus est rapide et confidentiel.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Nom complet */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Nom complet</label>
                            <input
                                type="text"
                                name="nomLegal"
                                placeholder="Entrez votre nom complet"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Date de naissance */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Date de naissance</label>
                            <input
                                type="date"
                                name="dateNaissance"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Adresse</label>
                            <input
                                type="text"
                                name="adresse"
                                placeholder="Adresse complète"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Nationalité */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Nationalité</label>
                            <input
                                type="text"
                                name="nationalite"
                                placeholder="Votre nationalité"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Type de pièce */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Type de pièce d'identité</label>
                            <select
                                name="typePiece"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                            >
                                <option value="CNI">Carte Nationale d'Identité</option>
                                <option value="PASSPORT">Passeport</option>
                                <option value="PERMIS_CONDUIRE">Permis de conduire</option>
                            </select>
                        </div>

                        {/* Numéro de pièce */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Numéro de pièce</label>
                            <input
                                type="text"
                                name="numeroPiece"
                                placeholder="Numéro de pièce"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Date d'expiration */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-800">Date d'expiration</label>
                            <input
                                type="date"
                                name="dateExpiration"
                                className="w-full border p-3 rounded-xl placeholder-gray-700 bg-[#4CA26033] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Document d'identité */}
                        <div className="mt-6">
                            <strong className="text-lg text-gray-900">Document d'identité</strong>

                            <div className="mt-3">
                                <label className="block font-semibold mb-1">Recto</label>
                                <p className="text-gray-600 mb-1 text-sm">Télécharger le recto de votre document</p>
                                <input type="file" name="photoRecto" onChange={handleChange} required />
                            </div>

                            <div className="mt-3">
                                <label className="block font-semibold mb-1">Verso</label>
                                <p className="text-gray-600 mb-1 text-sm">Télécharger le verso de votre document</p>
                                <input type="file" name="photoVerso" onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center mt-3">
                            <input
                                type="checkbox"
                                id="confirmInfo"
                                checked={confirmInfo}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="confirmInfo" className="text-gray-700 text-sm">
                                Je confirme que les informations fournies sont exactes et que les documents téléchargés sont valides.
                            </label>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-4 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition"
                                style={{ backgroundColor: "#4CA260" }}
                            >
                                {loading ? "Envoi..." : "Soumettre"}
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 font-semibold transition"
                                onClick={() => {
                                    setFormData({
                                        nomLegal: "",
                                        dateNaissance: "",
                                        adresse: "",
                                        nationalite: "",
                                        typePiece: "CNI",
                                        numeroPiece: "",
                                        dateExpiration: "",
                                        photoRecto: null,
                                        photoVerso: null,
                                    });
                                    setConfirmInfo(false);
                                }}
                            >
                                Annuler
                            </button>
                        </div>

                        {/* Conseils */}
                        <div className="mt-6 p-4 rounded-xl shadow-inner" style={{ backgroundColor: "#4CA26033", borderLeft: "4px solid #4CA260" }}>
                            <strong className="text-gray-900"> Conseil pour une vérification réussie </strong>
                            <p className="text-gray-700 mt-1 text-sm">
                                Assurez-vous que les documents sont clairs et lisibles. Le selfie doit montrer votre visage et le document d'identité clairement.
                                Les informations fournies doivent correspondre à celles de votre document.
                            </p>
                        </div>

                    </form>

                    {message && (
                        
                        <p className="mt-4 text-green-600 text-center font-medium">{message}</p>
                    )}
                </div>
            </div>

        </div>
    );

}
