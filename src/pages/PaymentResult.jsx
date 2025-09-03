import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../theme/colors";

export default function PaymentResult() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // On récupère les données passées 
  const { status, amount, cagnotteTitle, receiptLink, retryLink } = location.state || {};

  return (
    <div className="p-6 max-w-xl mx-auto mt-20 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Résultat du paiement</h2>

      {status === "success" ? (
        <div className="text-green-600">
          <p className="text-lg mb-2">✅ Votre paiement de {amount} FCFA pour "{cagnotteTitle}" a été effectué avec succès !</p>
          {receiptLink && (
            <button
              onClick={() => window.open(receiptLink, "_blank")}
              className="mt-2 px-4 py-2 rounded-md text-white hover:opacity-90 transition"
              style={{ backgroundColor: colors.primary }}
            >
              Télécharger le reçu
            </button>
          )}
        </div>
      ) : (
        <div className="text-red-600">
          <p className="text-lg mb-2">❌ Votre paiement de {amount} FCFA pour "{cagnotteTitle}" a échoué.</p>
          {retryLink && (
            <button
              onClick={() => navigate(retryLink)}
              className="mt-2 px-4 py-2 rounded-md text-white hover:opacity-90 transition"
              style={{ backgroundColor: colors.primary }}
            >
              Réessayer le paiement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
