import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // token depuis l'URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas");
      return;
    }

    // données mocks
    console.log("Réinitialisation avec token :", token, "nouveau mot de passe :", password);
    setMessage("✅ Mot de passe réinitialisé avec succès !");
    setTimeout(() => navigate("/login"), 2000);

    /*
    api.post(`/auth/reset-password/${token}`, { password })
      .then(res => {
        setMessage(res.data.message);
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(err => setMessage(err.response?.data?.error || "Erreur"));
    */
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#4CA260] text-white py-3 rounded-lg font-bold hover:bg-[#3B8E49] transition"
          >
            Réinitialiser
          </button>
        </form>

        {message && <p className="mt-4 text-[#4CA260]">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;

