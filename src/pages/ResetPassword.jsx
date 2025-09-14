import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../config/firebase";
import { confirmPasswordReset } from "firebase/auth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const oobCode = searchParams.get("oobCode"); // Récupère le code Firebase depuis l'URL

  useEffect(() => {
    if (!oobCode) {
      setError("Lien de réinitialisation invalide ou expiré");
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("✅ Mot de passe réinitialisé avec succès ! Redirection vers la page de connexion...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      let errorMessage = "Erreur lors de la réinitialisation";

      if (error.code === "auth/expired-action-code") {
        errorMessage = "Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "Le lien de réinitialisation est invalide.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Ce compte utilisateur est désactivé.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Utilisateur non trouvé.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Lien invalide</h2>
          <p className="text-gray-600 text-center mb-6">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-[#4CA260] text-white py-3 rounded-lg font-bold hover:bg-[#3B8E49] transition"
          >
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Réinitialiser le mot de passe</h2>
        <p className="mb-6 text-gray-600 text-center text-sm">
          Entrez votre nouveau mot de passe
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA260] focus:border-transparent bg-[#4CA26033] placeholder-gray-700 transition-colors"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA260] focus:border-transparent bg-[#4CA26033] placeholder-gray-700 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#4CA260] text-white py-3 rounded-lg font-bold hover:bg-[#3B8E49] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Réinitialisation...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

