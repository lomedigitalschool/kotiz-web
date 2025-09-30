import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const WithdrawPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cagnotte, setCagnotte] = useState(null);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("iban"); // iban | mobile
    const [iban, setIban] = useState("");
    const [phone, setPhone] = useState("");
    const [mobileProvider, setMobileProvider] = useState("Moov"); // Moov | TMoney | Orange
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Charger les infos cagnotte (montant dispo)
    useEffect(() => {
        const fetchCagnotte = async () => {
            try {
                const res = await api.get(`/pulls/${id}`);
                setCagnotte(res.data);
            } catch (err) {
                setError("Impossible de charger la cagnotte.");
            }
        };
        fetchCagnotte();
    }, [id]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!amount || Number(amount) <= 0) {
                setError("Montant invalide.");
                return;
            }
            if (Number(amount) > (cagnotte.currentAmount || 0)) {
                setError("Montant supérieur au solde disponible.");
                return;
            }

            const payload = {
                amount: Number(amount),
                method,
                iban: method === "iban" ? iban : undefined,
                phone: method === "mobile" ? phone : undefined,
                provider: method === "mobile" ? mobileProvider : undefined,
            };

            await api.post(`/cagnottes/${id}/withdrawals`, payload);

            setSuccess("Retrait en cours de traitement ✅");
            setTimeout(() => navigate("/transactions"), 2000); // rediriger vers historique
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du retrait.");
        } finally {
            setLoading(false);
        }
    };

    if (!cagnotte) return <p>Chargement...</p>;

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-4">Retirer fonds de "{cagnotte.title}"</h1>
            <p className="mb-3 text-gray-600">
                Solde disponible : <strong>{cagnotte.currentAmount} {cagnotte.currency}</strong>
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
                {/* Montant */}
                <div>
                    <label className="block font-medium">Montant à retirer</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Méthode */}
                <div>
                    <label className="block font-medium">Méthode de retrait</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded px-3 py-2">
                        <option value="iban">Compte bancaire (IBAN)</option>
                        <option value="mobile">Mobile Money</option>
                    </select>
                </div>

                {/* Champs spécifiques */}
                {method === "iban" && (
                    <div>
                        <label className="block font-medium">IBAN</label>
                        <input
                            type="text"
                            value={iban}
                            onChange={(e) => setIban(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="FR76 3000 6000 0112...."
                        />
                    </div>
                )}

                {method === "mobile" && (
                    <div className="space-y-2">
                        <div>
                            <label className="block font-medium">Opérateur</label>
                            <select
                                value={mobileProvider}
                                onChange={(e) => setMobileProvider(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="Moov">Moov</option>
                                <option value="TMoney">TMoney</option>
                                <option value="Orange">Orange Money</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium">Numéro Mobile Money</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                placeholder="+228 90 00 00 00"
                            />
                        </div>
                    </div>
                )}
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-md hover:opacity-90"
                >
                    {loading ? "Traitement..." : "Confirmer le retrait"}
                </button>
            </form>
        </div>
    );
};

export default WithdrawPage;
