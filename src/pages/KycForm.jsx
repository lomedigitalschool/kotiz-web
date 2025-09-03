import React, { useState, useEffect } from "react";



export default function KycFormMock() {
    const [formData, setFormData] = useState({
        nomLegal: "",
        dateNaissance: "",
        adresse: "",
        typePiece: "CNI",
        numeroPiece: "",
        dateExpiration: "",
        photoRecto: null,
        photoVerso: null,
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // va Simuler un appel API pour récupérer le statut KYC
    useEffect(() => {
        setTimeout(() => {
            setStatus({
                statutVerification: "EN_ATTENTE",
                commentaireAdmin: null,
            });
        }, 800);
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Simulation d'envoi
        setTimeout(() => {
            setMessage("Votre demande KYC a été soumise avec succès !");
            setStatus({ statutVerification: "EN_ATTENTE", commentaireAdmin: null });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Vérifier mon identité (KYC)</h2>

            {/* Affichage du statut */}
            {status && (
                <div className="mb-4 p-3 rounded border bg-gray-50">
                    <p>
                        <strong>Statut :</strong> {status.statutVerification}
                    </p>
                    {status.commentaireAdmin && (
                        <p className="text-red-500 mt-1">
                            Motif : {status.commentaireAdmin}
                        </p>
                    )}
                </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="nomLegal"
                    placeholder="Nom légal"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="dateNaissance"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="adresse"
                    placeholder="Adresse"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                    required
                />
                <select
                    name="typePiece"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                >
                    <option value="CNI">Carte Nationale d'Identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="PERMIS_CONDUIRE">Permis de conduire</option>
                </select>
                <input
                    type="text"
                    name="numeroPiece"
                    placeholder="Numéro de pièce"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="dateExpiration"
                    className="w-full border p-2 rounded"
                    onChange={handleChange}
                    required
                />

                {/* Uploads */}
                <div>
                    <label>Photo recto : </label>
                    <input type="file" name="photoRecto" onChange={handleChange} required />
                </div>
                <div>
                    <label>Photo verso : </label>
                    <input type="file" name="photoVerso" onChange={handleChange} required />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded text-white"
                    style={{ backgroundColor: "#4CA260" }}
                >
                    {loading ? "Envoi..." : "Soumettre"}
                </button>

            </form>

            {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>

    ) ;


}

