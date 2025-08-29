import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";

const ContributePage = () => {
  const { id } = useParams();
  const { cagnotte, contributions, loading, error, fetchCagnotte, addContribution } =
    useCagnotteStore();

  const [amount, setAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);

  // États locaux pour la soumission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Erreurs inline
  const [amountError, setAmountError] = useState("");
  const [messageError, setMessageError] = useState("");

  // Chargement cagnotte au montage
  useEffect(() => {
    fetchCagnotte(Number(id));
  }, [id, fetchCagnotte]);

  if (loading) return <p style={{ marginTop: "5rem", textAlign: "center", color: "#6b7280" }}>Chargement...</p>;
  if (error) return <p style={{ marginTop: "5rem", textAlign: "center", color: "#dc2626" }}>{error}</p>;
  if (!cagnotte) return null;

  // Validation basique formulaire
  const validateForm = () => {
    let isValid = true;
    setAmountError("");
    setMessageError("");

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAmountError("Veuillez entrer un montant valide supérieur à 0.");
      isValid = false;
    }

    if (message.length > 200) {
      setMessageError("Le message ne doit pas dépasser 200 caractères.");
      isValid = false;
    }

    return isValid;
  };

  // Simulation soumission API
  const submitContribution = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockContribution = {
        ...data,
        id: contributions.length + 1,
        paymentReference: `PAY-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const mockTransaction = {
        id: Date.now(),
        contributionId: mockContribution.id,
        paymentMethodId: 1,
        amount: mockContribution.amount,
        currency: cagnotte.currency,
        status: "completed",
        providerReference: `PROV-${Date.now()}`,
        providerResponse: "Mock response",
        createdAt: new Date().toISOString(),
      };

      addContribution(mockContribution);

      setReceipt({
        contribution: mockContribution,
        transaction: mockTransaction,
        cagnotteTitle: cagnotte.title,
        userName: mockContribution.anonymous ? "Anonyme" : "Utilisateur",
      }
    );

      // Reset
      setAmount("");
      setAnonymous(false);
      setMessage("");
    } catch (err) {
      setSubmitError("Une erreur est survenue lors de la contribution.");
    } finally {
      setSubmitting(false);
       }

  };

  // Gestion submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newContribution = {
      cagnotteId: cagnotte.id,
      userId: anonymous ? null : 1,
      amount: Number(amount),
      anonymous,
      message,
    };

    submitContribution(newContribution);
  };

  return (
    <div className="p-6 mx-auto" style={{ maxWidth: "750px", fontFamily: "Roboto, sans-serif" }}>
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Contribuer à "{cagnotte.title}"
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow"
        style={{ padding: "1.5rem" }}
      >
        <div>
          <label className="block font-medium mb-1" style={{ color: "#374151" }}>
            Montant ({cagnotte.currency})
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Entrez le montant"
          />
          {amountError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{amountError}</p>}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
            id="anonymous"
            style={{ width: "1rem", height: "1rem" }}
          />
          <label htmlFor="anonymous" style={{ color: "#374151" }}>
            Contribuer anonymement
          </label>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1" style={{ color: "#374151" }}>
            Message (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Votre message de soutien..."
            maxLength={200}
          />
          {messageError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{messageError}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 text-white font-semibold rounded-md transition ${
            submitting ? "bg-gray-400" : "bg-primary hover:opacity-90"
          }`}
          style={{ marginTop: "1rem" }}
        >
          {submitting ? "Traitement..." : "Contribuer"}
        </button>

        {submitError && (
          <p style={{ color: "#dc2626", textAlign: "center", marginTop: "0.5rem" }}>{submitError}</p>
        )}
      </form>

      {receipt && (
        <div
          className="mt-6 rounded shadow"
          style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e", padding: "1.5rem" }}
        >
          <h2 className="text-2xl font-bold mb-2">Reçu de paiement</h2>
          <p><strong>Cagnotte :</strong> {receipt.cagnotteTitle}</p>
          <p><strong>Contributeur :</strong> {receipt.userName}</p>
          <p><strong>Montant :</strong> {receipt.contribution.amount} {cagnotte.currency}</p>
          {receipt.contribution.message && <p><strong>Message :</strong> {receipt.contribution.message}</p>}
          <p><strong>Référence paiement :</strong> {receipt.contribution.paymentReference}</p>
          <p><strong>Transaction ID :</strong> {receipt.transaction.id}</p>
          <p><strong>Statut :</strong> {receipt.transaction.status}</p>
          <p><strong>Référence fournisseur :</strong> {receipt.transaction.providerReference}</p>
          <p><strong>Date :</strong> {new Date(receipt.contribution.createdAt).toLocaleString()}</p>
        </div>
      )
      }
    </div>
  );

};

export default ContributePage;









