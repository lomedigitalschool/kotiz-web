import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCagnotteStore } from "../stores/cagnotteStore";
import PhoneInput from "../components/PhoneInput";
import paymentService from "../services/paymentService";


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
  const [userPhone, setUserPhone] = useState(""); // Pour utilisateurs connectés
  const [guestNameError, setGuestNameError] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");
  const [guestPhoneError, setGuestPhoneError] = useState("");
  const [userPhoneError, setUserPhoneError] = useState("");


  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [mobileOption, setMobileOption] = useState("moov_money");


  // Charger les données de la cagnotte
  useEffect(() => {
    const fetchCagnotteData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/pulls/${id}`);

        // Inspecter les données récupérées
        console.log("📥 Données cagnotte récupérées:", response.data);

        // Harmoniser le champ titre
        const data = response.data.data || response.data; // selon la structure de l'API
        setCagnotte({
          ...data,
          title: data.title || data.name || data.pullTitle || "Cagnotte"
        });

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
    setUserPhoneError("");

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
    } else {
      // Pour utilisateurs connectés, vérifier le numéro de téléphone
      if (!userPhone.trim()) { setUserPhoneError("Numéro de téléphone requis pour le paiement."); isValid = false; }
    }

    return isValid;
  };

  // création de la contribution sur le serveur avec paiement réel
  const createContributionOnServer = async (payload) => {
    try {
      const method = paymentMethod === "mobile" ? mobileOption : "card";

      const contributionData = {
        pullId: id,
        amount: payload.amount,
        phoneNumber: payload.phoneNumber,
        paymentMethod: method,
        message: payload.message,
        isAnonymous: payload.anonymous
      };

      console.log("Initiation paiement avec PaymentService:", contributionData);
      return await paymentService.initiateContribution(contributionData);
    } catch (err) {
      console.error("Erreur contribution:", err);
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

      setAmount(""); setAnonymous(false); setMessage(""); setGuestName(""); setGuestEmail(""); setGuestPhone(""); setUserPhone("");
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

    // Ouvrir un onglet vide au moment du clic utilisateur (avant la requête asynchrone)
    const paymentTab = window.open('', '_blank');

    try {
      setSubmitting(true); setSubmitError("");

      const serverPayload = {
        amount: Number(amount),
        message,
        anonymous,
        paymentMethod,
        mobileOption: paymentMethod === "mobile" ? mobileOption : undefined,
        phoneNumber: isGuest ? guestPhone : userPhone,
        guestName: isGuest ? guestName : undefined,
        guestEmail: isGuest ? guestEmail : undefined,
        guestPhone: isGuest ? guestPhone : undefined
      };

      const serverResp = await createContributionOnServer(serverPayload);

      if (serverResp?.success) {
        // Rafraîchir les données du store après contribution réussie
        try {
          console.log('🔄 Rafraîchissement des données après contribution réussie');

          // Rafraîchir toutes les cagnottes pour mettre à jour les statistiques
          await fetchAllCagnottes();

          // Rafraîchir les contributions utilisateur pour le dashboard
          if (!isGuest) {
            await fetchUserContributions();

            // Rafraîchir aussi les cagnottes utilisateur pour mettre à jour les montants et contributeurs
            const { fetchUserCagnottes } = useCagnotteStore.getState();
            if (fetchUserCagnottes) {
              await fetchUserCagnottes();
            }
          }

          console.log('✅ Données du dashboard rafraîchies après contribution');
        } catch (refreshError) {
          console.error('❌ Erreur lors du rafraîchissement des données:', refreshError);
        }

        // Contribution créée avec succès sur le serveur
        if (serverResp?.payment?.paymentUrl) {
          // Rediriger l'onglet pré-ouvert vers l'URL de paiement
          console.log("🔗 Redirection onglet paiement vers:", serverResp.payment.paymentUrl);
          if (paymentTab) {
            paymentTab.location.href = serverResp.payment.paymentUrl;
          } else {
            // Fallback si l'onglet a été fermé
            window.open(serverResp.payment.paymentUrl, '_blank');
          }

          // Rediriger vers la page de statut après un court délai
          setTimeout(() => {
            navigate(`/payment-status/${serverResp.contribution?.id}`);
          }, 1000);
          return;
        } else {
          // Paiement initié, fermer l'onglet vide et rediriger vers la page de suivi
          if (paymentTab) {
            paymentTab.close();
          }
          console.log("📊 Redirection vers suivi paiement:", serverResp.contribution?.id);
          navigate(`/payment-status/${serverResp.contribution?.id}`);
          return;
        }
      } else {
        // Échec du paiement, fermer l'onglet vide et afficher l'erreur
        if (paymentTab) {
          paymentTab.close();
        }
        console.error("❌ Échec initiation paiement:", serverResp.error);
        setSubmitError(serverResp.error || "Erreur lors de l'initiation du paiement");
        return;
      }

    } catch (err) {
      // Erreur inattendue, fermer l'onglet vide
      if (paymentTab) {
        paymentTab.close();
      }
      console.error("Erreur inattendue:", err);
      setSubmitError("Une erreur inattendue s'est produite. Veuillez réessayer.");
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

        {/* Numéro de téléphone pour utilisateurs connectés */}
        {!isGuest && (
          <div className="mt-4">
            <label className="block font-medium mb-1" style={{ color: "#374151" }}>Numéro de téléphone (pour le paiement)</label>
            <PhoneInput value={userPhone} onChange={(e) => setUserPhone(e.target.value)} required />
            {userPhoneError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{userPhoneError}</p>}
          </div>
        )}

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
              <input type="radio" name="paymentMethod" value="mobile" checked={paymentMethod === "mobile"} onChange={() => setPaymentMethod("mobile")} />
              <span>Mobile Money (Orange Money / MTN / Moov / Wave / Flooz / T-Money)</span>
            </label>
          </div>

          {paymentMethod === "mobile" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="orange_money" checked={mobileOption === "orange_money"} onChange={() => setMobileOption("orange_money")} />
                <span>Orange Money</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="mtn_money" checked={mobileOption === "mtn_money"} onChange={() => setMobileOption("mtn_money")} />
                <span>MTN Mobile Money</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="moov_money" checked={mobileOption === "moov_money"} onChange={() => setMobileOption("moov_money")} />
                <span>Moov Money</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="wave" checked={mobileOption === "wave"} onChange={() => setMobileOption("wave")} />
                <span>Wave</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="flooz" checked={mobileOption === "flooz"} onChange={() => setMobileOption("flooz")} />
                <span>Flooz</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mobileOption" value="tmoney" checked={mobileOption === "tmoney"} onChange={() => setMobileOption("tmoney")} />
                <span>T-Money</span>
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

