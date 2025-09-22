import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCagnotteStore } from "../stores/cagnotteStore";
import PhoneInput from "../components/PhoneInput";


const ContributePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addContribution, fetchAllCagnottes, fetchUserContributions } = useCagnotteStore();

  const [cagnotte, setCagnotte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  
  const [amount, setAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // erreurs inline
  const [amountError, setAmountError] = useState("");
  const [messageError, setMessageError] = useState("");

  // gestion invité  et  utilisateur connecté
  const isLoggedIn = !!localStorage.getItem("token");
  const isGuest = !isLoggedIn;
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestNameError, setGuestNameError] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");
  const [guestPhoneError, setGuestPhoneError] = useState("");


  const [paymentMethod, setPaymentMethod] = useState("card");
  const [mobileOption, setMobileOption] = useState("tmoney");


  // Charger les données de la cagnotte
  useEffect(() => {
    const fetchCagnotteData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/pulls/${id}`);
        setCagnotte(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger la cagnotte.");
      } finally {
        setLoading(false);
      }
    };
    fetchCagnotteData();
  }, [id]);

  if (loading) return <p style={{ marginTop: "5rem", textAlign: "center", color: "#6b7280" }}>Chargement...</p>;
  if (error) return <p style={{ marginTop: "5rem", textAlign: "center", color: "#dc2626" }}>{error}</p>;
  if (!cagnotte) return null;

  // Validation du formulaire avant soumission
  const validateForm = () => {
    let isValid = true;
    setAmountError(""); setMessageError("");
    setGuestNameError(""); setGuestEmailError(""); setGuestPhoneError("");

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAmountError("Veuillez entrer un montant valide supérieur à 0.");
      isValid = false;
    }

    if (message.length > 240) {
      setMessageError("Le message ne doit pas dépasser 240 caractères.");
      isValid = false;
    }

    if (isGuest) {
      if (!guestName.trim()) { setGuestNameError("Votre nom est requis."); isValid = false; }
      if (!guestEmail.trim() || !guestEmail.includes("@")) { setGuestEmailError("Email valide requis."); isValid = false; }
      if (!guestPhone.trim()) { setGuestPhoneError("Numéro requis."); isValid = false; }
    }

    return isValid;
  };

  // création de la contribution sur le serveur
  const createContributionOnServer = async (payload) => {
    try {
      const method = paymentMethod === "mobile" ? "mobile_money" : "card";

      if (isGuest) {
        const guestPayload = {
          amount: payload.amount,
          message: payload.message,
          paymentMethod: method,
          contributorName: payload.guestName,
          contributorEmail: payload.guestEmail,
          phoneNumber: payload.guestPhone,
          mobileOption: payload.mobileOption,
          anonymous: payload.anonymous,
        };

        console.log("Payload invité:", guestPayload);
        return (await api.post(`/public/contributions/anonymous/${id}`, guestPayload)).data;
      } else {
        // Contribution utilisateur connecté - utiliser l'endpoint correct
        const userPayload = {
          amount: payload.amount,
          message: payload.message,
          paymentMethod: method,
          anonymous: payload.anonymous
        };

        console.log("Payload utilisateur connecté:", userPayload);
        return (await api.post(`/pulls/${id}/contribute`, userPayload)).data;
      }
    } catch (err) {
      console.error("Erreur contribution:", err.response?.data || err.message);
      throw err;
    }
  };

  // soumission locale pour mise à jour imediate
  const submitContribution = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newContribution = {
        ...data,
        id: Date.now(),
        paymentReference: `PAY-${Date.now()}`,
        createdAt: new Date().toISOString(),
        currency: cagnotte.currency,
        cagnotteTitle: cagnotte.title,
        status: "completed"
      };

      // Ajout dans le store local
      addContribution({
        ...newContribution,
        user: anonymous ? "Anonyme" : isGuest ? guestName : "Utilisateur connecté"
      });

      // Rafraîchir les données depuis le serveur pour synchronisation
      try {
        console.log('🔄 Rafraîchissement des données après contribution');
        
        // Attendre un peu pour que le serveur traite la contribution
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Rafraîchir toutes les cagnottes pour la page explorer
        await fetchAllCagnottes();
        
        // Rafraîchir les contributions utilisateur pour le dashboard et transactions
        if (!isGuest) {
          await fetchUserContributions();
          
          // Rafraîchir aussi les cagnottes utilisateur pour mettre à jour les montants
          const { fetchUserCagnottes } = useCagnotteStore.getState();
          if (fetchUserCagnottes) {
            await fetchUserCagnottes();
          }
        }
        
        console.log('✅ Données rafraîchies avec succès');
      } catch (refreshError) {
        console.error('❌ Erreur lors du rafraîchissement des données:', refreshError);
      }

      // Préparer les données pour la page de reçu
      const receiptData = {
        contribution: newContribution,
        transaction: {
          id: Date.now() + 1,
          status: "completed",
          providerReference: `PROV-${Date.now()}`
        },
        cagnotteTitle: cagnotte.title,
        userName: newContribution.anonymous ? "Anonyme" : isGuest ? guestName : "Utilisateur connecté",
        contributorEmail: isGuest ? guestEmail : undefined,
        contributorPhone: isGuest ? guestPhone : undefined
      };

      // Rediriger vers la page de reçu avec les données
      navigate('/receipt', { state: { receiptData } });

      setAmount(""); setAnonymous(false); setMessage(""); setGuestName(""); setGuestEmail(""); setGuestPhone("");
    } catch (err) {
      setSubmitError("Une erreur est survenue lors de la contribution.");
    } finally {
      setSubmitting(false);
    }
  };

  // soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newContribution = { cagnotteId: cagnotte.id, userId: anonymous ? null : 1, amount: Number(amount), anonymous, message };

    try {
      setSubmitting(true); setSubmitError("");

      const serverPayload = {
        amount: Number(amount),
        message,
        anonymous,
        paymentMethod,
        mobileOption,
        guestName,
        guestEmail,
        guestPhone
      };

      const serverResp = await createContributionOnServer(serverPayload);

      // Si le serveur renvoie une redirection, on redirige
      if (serverResp?.redirectUrl) { window.location.href = serverResp.redirectUrl; return; }

      await submitContribution(newContribution);

    } catch (err) {
      // mme si le serveur echoue on met à jour localement
      await submitContribution(newContribution);
    } finally { setSubmitting(false); }
  };


  return (
    <div className="p-6 mx-auto" style={{ maxWidth: "750px", fontFamily: "Roboto, sans-serif" }}>
      {/* Bouton retour */}
      <button onClick={() => window.history.back()} className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">← Retour</button>

      <h1 className="text-4xl font-bold mb-6 text-gray-800">Contribuer à "{cagnotte.title || 'Cagnotte'}"</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow" style={{ padding: "1.5rem" }}>
        {/* Montant */}
        <div>
          <label className="block font-medium mb-1" style={{ color: "#374151" }}>Montant ({cagnotte.currency || 'FCFA'})</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Entrez le montant" />
          {amountError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{amountError}</p>}
        </div>

        {/* Checkbox anonymat */}
        <div className="flex items-center gap-2 mt-3">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} id="anonymous" style={{ width: "1rem", height: "1rem" }} />
          <label htmlFor="anonymous" style={{ color: "#374151" }}>Contribuer anonymement</label>
        </div>

        {/* Champs pour invité uniquement */}
        {isGuest && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1" style={{ color: "#374151" }}>Nom (reçu)</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Votre nom" />
              {guestNameError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{guestNameError}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: "#374151" }}>Email (reçu)</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex: Sylvie@domaine.com" />
              {guestEmailError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{guestEmailError}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: "#374151" }}>Numéro (reçu)</label>
              <PhoneInput value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required />
              {guestPhoneError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{guestPhoneError}</p>}
            </div>
          </div>
        )}

        {/* Champ message */}
        <div className="mt-4">
          <label className="block font-medium mb-1" style={{ color: "#374151" }}>Message (optionnel)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Votre message de soutien..." maxLength={240} />
          {messageError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{messageError}</p>}
        </div>

        {/* Moyen de paiement */}
        <div className="mt-4">
          <label className="block font-medium mb-2" style={{ color: "#374151" }}>Moyen de paiement</label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
              <span>Carte bancaire (Stripe/Flutterwave)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentMethod" value="mobile" checked={paymentMethod === "mobile"} onChange={() => setPaymentMethod("mobile")} />
              <span>Mobile Money (TMoney / Flooz / Orange)</span>
            </label>
          </div>

          {paymentMethod === "mobile" && (
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="tmoney" checked={mobileOption === "tmoney"} onChange={() => setMobileOption("tmoney")} />
                <span>TMoney</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="flooz" checked={mobileOption === "flooz"} onChange={() => setMobileOption("flooz")} />
                <span>Flooz</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="orange" checked={mobileOption === "orange"} onChange={() => setMobileOption("orange")} />
                <span>Orange</span>
              </label>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className={`w-full py-3 text-white font-semibold rounded-md transition ${submitting ? "bg-gray-400" : "bg-primary hover:opacity-90"}`} style={{ marginTop: "1rem" }}>
          {submitting ? "Traitement..." : "Valider et payer"}
        </button>
        {submitError && <p style={{ color: "#dc2626", textAlign: "center", marginTop: "0.5rem" }}>{submitError}</p>}
      </form>


    </div>
  );

}
  ;


export default ContributePage;

