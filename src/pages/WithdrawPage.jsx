import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const WithdrawPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cagnotte, setCagnotte] = useState(null);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("iban"); // iban | mobile
    const [iban, setIban] = useState("");
    const [phone, setPhone] = useState("");
    const [mobileProvider, setMobileProvider] = useState("Moov"); // Moov | TMoney | Orange
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [kycStatus, setKycStatus] = useState(null);
    const [kycLoading, setKycLoading] = useState(true);

    // Charger les infos cagnotte (montant dispo)
    useEffect(() => {
        const fetchCagnotte = async () => {
            try {
                console.log('Chargement cagnotte ID:', id);
                const response = await api.get(`/pulls/${id}`);
                console.log('📥 Données cagnotte récupérées:', response.data);
                
                // Harmoniser le champ titre comme dans ContributePage
                const data = response.data.data || response.data;
                const cagnotteData = {
                    ...data,
                    title: data.title || data.name || data.pullTitle || "Cagnotte"
                };
                
                if (!cagnotteData || !cagnotteData.id) {
                    throw new Error('Données de cagnotte invalides');
                }
                
                console.log('Cagnotte chargée:', cagnotteData.title, 'Status:', cagnotteData.status);
                setCagnotte(cagnotteData);
            } catch (err) {
                console.error('Erreur chargement cagnotte:', err);
                const errorMessage = err.response?.data?.error || err.message || "Impossible de charger la cagnotte.";
                setError(errorMessage);
            }
        };
        
        if (id) {
            fetchCagnotte();
        }
    }, [id]);

    // récupérer le statut KYC de l'utilisateur
    useEffect(() => {
        const fetchKycStatus = async () => {
            try {
                setKycLoading(true);
                const response = await api.get('/kyc/status');
                setKycStatus(response.data.data);
            } catch (error) {
                console.error('Erreur récupération statut KYC:', error);
                setKycStatus({ hasActiveKyc: false, status: null });
            } finally {
                setKycLoading(false);
            }
        };

        if (user) {
            fetchKycStatus();
        }
    }, [user]);

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

            await api.post(`/pulls/${id}/withdraw`, payload);

            setSuccess("Retrait en cours de traitement ✅");
            setTimeout(() => navigate("/transactions"), 2000); // rediriger vers historique
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du retrait.");
        } finally {
            setLoading(false);
        }
    };

    if (error && !cagnotte) {
        return (
            <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-10">
                <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded-md">
                    <p className="font-semibold">Erreur</p>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }
    
    if (!cagnotte) return <p className="text-center mt-10">Chargement de la cagnotte...</p>;
    if (kycLoading) return <p className="text-center mt-[80px] text-gray-500">Vérification KYC...</p>;

    const isClosed = cagnotte.status === 'closed';
    const hasApprovedKyc = kycStatus && kycStatus.statutVerification === 'APPROUVE';
    
    // Calculer les vraies conditions de retrait
    const isGoalReached = cagnotte.currentAmount >= cagnotte.goalAmount;
    const isDeadlinePassed = cagnotte.deadline && new Date() > new Date(cagnotte.deadline);
    
    // Conditions de retrait : (fermée OU objectif atteint OU deadline dépassée) ET KYC validé
    const canWithdraw = (isClosed || isGoalReached || isDeadlinePassed) && hasApprovedKyc;
    
    console.log('Conditions retrait:', {
        isClosed,
        isGoalReached,
        isDeadlinePassed,
        hasApprovedKyc,
        canWithdraw
    });

    if (!canWithdraw) {
        return (
            <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-10">
                <h1 className="text-2xl font-bold mb-4">Retirer fonds de "{cagnotte.title || 'Cagnotte'}"</h1>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-md">
                    <p className="font-semibold">Conditions de retrait non remplies</p>
                    <p>Pour retirer des fonds, vous devez avoir un KYC validé ET (cagnotte fermée OU objectif atteint OU date limite dépassée).</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={async () => {
                                try {
                                    await api.post(`/pulls/${id}/close`);
                                    window.location.reload();
                                } catch (err) {
                                    alert('Erreur lors de la fermeture: ' + (err.response?.data?.error || err.message));
                                }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Fermer la cagnotte
                        </button>
                        <button
                            onClick={() => navigate(`/cagnottes/${id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Retour à la cagnotte
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Cette section n'est plus nécessaire car gérée dans canWithdraw
    if (false) {
        return (
            <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-10">
                <h1 className="text-2xl font-bold mb-4">Retirer fonds de "{cagnotte.title || 'Cagnotte'}"</h1>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <div>
                            <p className="font-semibold">Vérification d'identité requise</p>
                            <p className="text-sm">Vous devez soumettre et faire valider vos documents KYC avant de pouvoir retirer des fonds.</p>
                            <button
                                onClick={() => navigate('/kyc')}
                                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                            >
                                Soumettre KYC
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-4">Retirer fonds de "{cagnotte.title || 'Cagnotte'}"</h1>
            <p className="mb-3 text-gray-600">
                Solde disponible : <strong>{cagnotte.currentAmount || 0} {cagnotte.currency || 'XOF'}</strong>
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
